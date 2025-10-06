function setupMatchmaking(io) {
  const waitingPool = [];
  const userRooms = new Map();

  function broadcastUserCount() {
    const totalUsers = io.engine.clientsCount;
    io.emit("user_count", { count: totalUsers });
  }

  io.on("connection", (socket) => {
    waitingPool.push(socket);
    broadcastUserCount();

    if (waitingPool.length >= 2) {
      const user1 = waitingPool.shift();
      const user2 = waitingPool.shift();
      const roomId = `${user1.id}-${user2.id}`;
      user1.join(roomId);
      user2.join(roomId);
      userRooms.set(user1.id, roomId);
      userRooms.set(user2.id, roomId);
      io.to(roomId).emit("chat_started", { roomId });
    }

    socket.on("send_message", (data) => {
      const { roomId, message, senderId } = data;
      socket.to(roomId).emit("receive_message", { message, senderId });
    });

    socket.on("send_file", (data) => {
      const { roomId, file, fileName, fileType, fileSize, senderId } = data;
      const maxSize = 50 * 1024 * 1024;
      if (fileSize > maxSize) {
        socket.emit("file_error", { error: "File size exceeds 50MB limit" });
        return;
      }
      socket
        .to(roomId)
        .emit("receive_file", { file, fileName, fileType, fileSize, senderId });
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
      const roomId = userRooms.get(socket.id);
      if (roomId) {
        io.to(roomId).emit("partner_left");
        userRooms.delete(socket.id);
      }
      const waitingIndex = waitingPool.findIndex((s) => s.id === socket.id);
      if (waitingIndex !== -1) {
        waitingPool.splice(waitingIndex, 1);
      }
      broadcastUserCount();
    });
  });
}

module.exports = { setupMatchmaking };
