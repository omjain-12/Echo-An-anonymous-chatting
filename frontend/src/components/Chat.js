import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:5001";
const socket = io(BACKEND_URL);

function Chat() {
  const [chatState, setChatState] = useState("SEARCHING");
  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    socket.on("chat_started", (data) => {
      console.log("Chat started:", data);
      setRoomId(data.roomId);
      setChatState("CHATTING");
      setMessages([]);
    });

    socket.on("receive_message", (data) => {
      console.log("Message received:", data);
      setMessages((prev) => [
        ...prev,
        { text: data.message, sender: "partner", type: "text" },
      ]);
    });

    socket.on("receive_file", (data) => {
      console.log("File received:", data.fileName);
      setMessages((prev) => [
        ...prev,
        {
          file: data.file,
          fileName: data.fileName,
          fileType: data.fileType,
          fileSize: data.fileSize,
          sender: "partner",
          type: "file",
        },
      ]);
    });

    socket.on("file_error", (data) => {
      alert(data.error);
      setUploadProgress(null);
    });

    socket.on("partner_left", () => {
      console.log("Partner left");
      setChatState("DISCONNECTED");
    });

    return () => {
      socket.off("chat_started");
      socket.off("receive_message");
      socket.off("receive_file");
      socket.off("file_error");
      socket.off("partner_left");
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();

    if (currentMessage.trim() === "") return;

    socket.emit("send_message", {
      roomId,
      message: currentMessage,
      senderId: socket.id,
    });

    setMessages((prev) => [
      ...prev,
      { text: currentMessage, sender: "me", type: "text" },
    ]);
    setCurrentMessage("");
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File size exceeds 50MB limit. Please choose a smaller file.");
      e.target.value = "";
      return;
    }

    setUploadProgress({ fileName: file.name, status: "uploading" });

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileData = event.target.result;

      socket.emit("send_file", {
        roomId,
        file: fileData,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        senderId: socket.id,
      });

      setMessages((prev) => [
        ...prev,
        {
          file: fileData,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          sender: "me",
          type: "file",
        },
      ]);

      setUploadProgress(null);
      e.target.value = "";
    };

    reader.onerror = () => {
      alert("Error reading file. Please try again.");
      setUploadProgress(null);
      e.target.value = "";
    };

    reader.readAsArrayBuffer(file);
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const downloadFile = (fileData, fileName, fileType) => {
    const blob = new Blob([fileData], { type: fileType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const isImageFile = (fileType) => {
    return fileType && fileType.startsWith("image/");
  };

  const isVideoFile = (fileType) => {
    return fileType && fileType.startsWith("video/");
  };

  const findNewPartner = () => {
    window.location.reload();
  };

  return (
    <div className="app">
      <div className="app-header">
        <h1>Echo Chat</h1>
      </div>

      {chatState === "SEARCHING" && (
        <div className="chat-container">
          <div className="status-text">🔍 Searching for a partner...</div>
        </div>
      )}

      {chatState === "CHATTING" && (
        <>
          <div className="message-list">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.type === "text" ? (
                  msg.text
                ) : (
                  <div className="file-message">
                    {isImageFile(msg.fileType) ? (
                      <div className="image-preview">
                        <img
                          src={URL.createObjectURL(
                            new Blob([msg.file], { type: msg.fileType })
                          )}
                          alt={msg.fileName}
                          onClick={() =>
                            downloadFile(msg.file, msg.fileName, msg.fileType)
                          }
                        />
                      </div>
                    ) : isVideoFile(msg.fileType) ? (
                      <div className="video-preview">
                        <video
                          controls
                          src={URL.createObjectURL(
                            new Blob([msg.file], { type: msg.fileType })
                          )}
                        />
                      </div>
                    ) : (
                      <div className="file-info">
                        <span className="file-icon">📎</span>
                        <div className="file-details">
                          <div className="file-name">{msg.fileName}</div>
                          <div className="file-size">
                            {formatFileSize(msg.fileSize)}
                          </div>
                        </div>
                      </div>
                    )}
                    <button
                      className="download-btn"
                      onClick={() =>
                        downloadFile(msg.file, msg.fileName, msg.fileType)
                      }
                    >
                      ⬇ Download
                    </button>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form className="input-area" onSubmit={sendMessage}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
            <button
              type="button"
              className="attach-btn"
              onClick={handleAttachClick}
              title="Attach file (max 50MB)"
            >
              📎
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
            />
            <button type="submit">Send</button>
          </form>
          {uploadProgress && (
            <div className="upload-status">
              Uploading {uploadProgress.fileName}...
            </div>
          )}
        </>
      )}

      {chatState === "DISCONNECTED" && (
        <div className="chat-container">
          <div className="status-text">😔 Your partner has left the chat</div>
          <button className="find-new-btn" onClick={findNewPartner}>
            Find a New Partner
          </button>
        </div>
      )}
    </div>
  );
}

export default Chat;
