const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const httpServer = http.createServer(app);

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  maxHttpBufferSize: 50 * 1024 * 1024,
});

const waitingPool = [];
const userRooms = new Map();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  waitingPool.push(socket);
  console.log(`Waiting pool size: ${waitingPool.length}`);

  if (waitingPool.length >= 2) {
    const user1 = waitingPool.shift();
    const user2 = waitingPool.shift();
    const roomId = `${user1.id}-${user2.id}`;

    user1.join(roomId);
    user2.join(roomId);

    userRooms.set(user1.id, roomId);
    userRooms.set(user2.id, roomId);

    console.log(`Paired users: ${user1.id} and ${user2.id} in room ${roomId}`);
    io.to(roomId).emit("chat_started", { roomId });
  }

  socket.on("send_message", (data) => {
    const { roomId, message, senderId } = data;
    console.log(`Message from ${senderId} in room ${roomId}: ${message}`);
    socket.to(roomId).emit("receive_message", { message, senderId });
  });

  socket.on("send_file", (data) => {
    const { roomId, file, fileName, fileType, fileSize, senderId } = data;
    console.log(
      `File from ${senderId} in room ${roomId}: ${fileName} (${fileSize} bytes)`
    );

    const maxSize = 50 * 1024 * 1024;
    if (fileSize > maxSize) {
      socket.emit("file_error", { error: "File size exceeds 50MB limit" });
      return;
    }

    socket.to(roomId).emit("receive_file", {
      file,
      fileName,
      fileType,
      fileSize,
      senderId,
    });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    const roomId = userRooms.get(socket.id);

    if (roomId) {
      io.to(roomId).emit("partner_left");
      console.log(`Notified room ${roomId} that partner left`);
      userRooms.delete(socket.id);
    }

    const waitingIndex = waitingPool.findIndex((s) => s.id === socket.id);
    if (waitingIndex !== -1) {
      waitingPool.splice(waitingIndex, 1);
      console.log(`Removed from waiting pool. New size: ${waitingPool.length}`);
    }
  });
});

const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
