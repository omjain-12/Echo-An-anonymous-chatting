const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const sdk = require("microsoft-cognitiveservices-speech-sdk");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.post("/api/synthesize-speech", (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Missing or invalid 'text'" });
    }
    const key = process.env.SPEECH_KEY;
    const region = process.env.SPEECH_REGION;
    if (!key || !region) {
      return res
        .status(500)
        .json({ error: "Speech service credentials not configured" });
    }
    const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
    speechConfig.speechSynthesisOutputFormat =
      sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null);
    synthesizer.speakTextAsync(
      text,
      (result) => {
        try {
          synthesizer.close();
          if (!result) {
            return res.status(500).json({ error: "Empty synthesis result" });
          }
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            const audioData = Buffer.from(result.audioData);
            if (!audioData || audioData.length === 0) {
              return res.status(500).json({ error: "No audio data returned" });
            }
            res.setHeader("Content-Type", "audio/mpeg");
            res.setHeader("Content-Length", audioData.length);
            return res.status(200).end(audioData);
          }
          const details = sdk.CancellationDetails.fromResult(result);
          return res
            .status(500)
            .json({ error: details?.errorDetails || "Synthesis canceled" });
        } catch (err) {
          return res
            .status(500)
            .json({ error: "Error processing synthesis result" });
        }
      },
      (error) => {
        try {
          console.error("Speech synthesis error:", error);
          synthesizer.close();
        } catch {}
        return res.status(500).json({ error: "Error synthesizing speech" });
      }
    );
  } catch (e) {
    console.error("Speech route error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

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

function broadcastUserCount() {
  const totalUsers = io.engine.clientsCount;
  io.emit("user_count", { count: totalUsers });
}

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  waitingPool.push(socket);
  console.log(`Waiting pool size: ${waitingPool.length}`);

  broadcastUserCount();

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

  socket.on("typing", (data) => {
    const { roomId } = data;
    socket.to(roomId).emit("partner_typing");
  });

  socket.on("stop_typing", (data) => {
    const { roomId } = data;
    socket.to(roomId).emit("partner_stop_typing");
  });

  socket.on("send_reaction", (data) => {
    const { roomId, messageIndex, reaction } = data;
    socket.to(roomId).emit("receive_reaction", { messageIndex, reaction });
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

    broadcastUserCount();
  });
});

const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
