import React, { useState, useEffect, useRef } from "react";
import soundOnIcon from "../assets/icons/sound-on.svg";
import soundOffIcon from "../assets/icons/sound-off.svg";
import skipIcon from "../assets/icons/skip.svg";
import clockIcon from "../assets/icons/clock.svg";
import sentIcon from "../assets/icons/sent.svg";
import receivedIcon from "../assets/icons/received.svg";
import userCountIcon from "../assets/icons/user-count.svg";
import speakerIcon from "../assets/icons/speaker.svg";
import stopIcon from "../assets/icons/stop.svg";
import timerIcon from "../assets/icons/timer.svg";
import paperclipIcon from "../assets/icons/paperclip.svg";
import emojiIcon from "../assets/icons/emoji.svg";
import downloadIcon from "../assets/icons/download.svg";
import copyIcon from "../assets/icons/copy.svg";
import checkIcon from "../assets/icons/check.svg";
import linkIcon from "../assets/icons/link.svg";
import likeIcon from "../assets/icons/like.svg";
import loveIcon from "../assets/icons/love.svg";
import laughIcon from "../assets/icons/laugh.svg";
import statusGood from "../assets/icons/status-good.svg";
import statusFair from "../assets/icons/status-fair.svg";
import statusPoor from "../assets/icons/status-poor.svg";
import chatIcon from "../assets/icons/chat.svg";
import lockIcon from "../assets/icons/lock.svg";
import searchIcon from "../assets/icons/search.svg";
import { io } from "socket.io-client";
const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:5001";
const socket = io(BACKEND_URL);

function Chat() {
  const [chatState, setChatState] = useState("SEARCHING");
  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState(null);
  const [currentMessage, setCurrentMessage] = useState("");
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const [userCount, setUserCount] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [connectionQuality, setConnectionQuality] = useState("good");
  const [messageReactions, setMessageReactions] = useState({});
  const [chatStartTime, setChatStartTime] = useState(null);
  const [chatDuration, setChatDuration] = useState(0);
  const [messagesSent, setMessagesSent] = useState(0);
  const [messagesReceived, setMessagesReceived] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);
  const [notificationSound] = useState(
    new Audio(
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSt9y/LaizsIEmWy6+yjWRQKTKXh8bllHAU2jdXzzn0xBSd5yPDejj4KE1616+uoVhMKR5/f8sFxJAUpfMry3Ik6CBBirunzpVkUCkyj4PG8aB4FNIvU8tGAMwUocMbv45FAQ"
    )
  );

  const audioRef = useRef(null);
  const lastAudioUrlRef = useRef(null);
  const [ttsLoadingIndex, setTtsLoadingIndex] = useState(null);

  const MAX_MESSAGE_LENGTH = 500;

  const emojis = [
    "😊",
    "😂",
    "❤️",
    "👍",
    "🎉",
    "😍",
    "🔥",
    "✨",
    "💯",
    "🙌",
    "😎",
    "🤔",
    "😢",
    "😭",
    "🥺",
    "😜",
    "🤗",
    "👏",
    "🙏",
    "💪",
  ];
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const speakMessage = async (text, index) => {
    try {
      if (!text || !text.trim()) return;
      if (speakingMessageIndex === index) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        setSpeakingMessageIndex(null);
        setTtsLoadingIndex(null);
        return;
      }
      if (
        typeof window !== "undefined" &&
        window.location.protocol === "https:" &&
        BACKEND_URL.startsWith("http:")
      ) {
        console.warn(
          "Speech request may be blocked due to mixed content. Use an https BACKEND_URL."
        );
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setSpeakingMessageIndex(index);
      setTtsLoadingIndex(index);
      const response = await fetch(`${BACKEND_URL}/api/synthesize-speech`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        mode: "cors",
      });
      if (!response.ok) {
        throw new Error(`TTS endpoint returned ${response.status}`);
      }
      const contentType = response.headers.get("content-type") || "audio/mpeg";
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: contentType });
      if (lastAudioUrlRef.current) {
        URL.revokeObjectURL(lastAudioUrlRef.current);
        lastAudioUrlRef.current = null;
      }
      const url = URL.createObjectURL(blob);
      lastAudioUrlRef.current = url;
      if (!audioRef.current) {
        const el = new Audio();
        audioRef.current = el;
      }
      audioRef.current.src = url;
      const playPromise = audioRef.current.play();
      if (playPromise && typeof playPromise.then === "function") {
        await playPromise;
      }
      audioRef.current.onended = () => {
        setSpeakingMessageIndex(null);
        setTtsLoadingIndex(null);
        if (lastAudioUrlRef.current) {
          URL.revokeObjectURL(lastAudioUrlRef.current);
          lastAudioUrlRef.current = null;
        }
      };
    } catch (error) {
      console.error("Speech synthesis failed:", error);
      setSpeakingMessageIndex(null);
      setTtsLoadingIndex(null);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape" && chatState === "CHATTING") {
        skipPartner();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [chatState]);

  useEffect(() => {
    const checkConnection = setInterval(() => {
      const now = Date.now();
      const timeSinceLastPing = now - (socket.io?.engine?.lastPing || now);

      if (timeSinceLastPing > 5000) {
        setConnectionQuality("poor");
      } else if (timeSinceLastPing > 2000) {
        setConnectionQuality("fair");
      } else {
        setConnectionQuality("good");
      }
    }, 2000);

    return () => clearInterval(checkConnection);
  }, []);

  useEffect(() => {
    if (chatState === "CHATTING" && !chatStartTime) {
      setChatStartTime(Date.now());
    }

    if (chatState === "CHATTING") {
      const timer = setInterval(() => {
        if (chatStartTime) {
          setChatDuration(Math.floor((Date.now() - chatStartTime) / 1000));
        }
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setChatStartTime(null);
      setChatDuration(0);
      setMessagesSent(0);
      setMessagesReceived(0);
    }
  }, [chatState, chatStartTime]);

  useEffect(() => {
    const hasVisited = localStorage.getItem("echoVisited");
    if (hasVisited) {
      setShowWelcome(false);
    }
  }, []);

  useEffect(() => {
    socket.on("chat_started", (data) => {
      console.log("Chat started:", data);
      setRoomId(data.roomId);
      setChatState("CHATTING");
      setMessages([]);
    });

    socket.on("receive_message", (data) => {
      console.log("Message received:", data);
      if (isSoundEnabled) {
        notificationSound
          .play()
          .catch((e) => console.log("Sound play failed:", e));
      }
      setMessagesReceived((prev) => prev + 1);
      setMessages((prev) => [
        ...prev,
        {
          text: data.message,
          sender: "partner",
          type: "text",
          timestamp: new Date(),
        },
      ]);
    });

    socket.on("receive_file", (data) => {
      console.log("File received:", data.fileName);
      if (isSoundEnabled) {
        notificationSound
          .play()
          .catch((e) => console.log("Sound play failed:", e));
      }
      setMessagesReceived((prev) => prev + 1);
      setMessages((prev) => [
        ...prev,
        {
          file: data.file,
          fileName: data.fileName,
          fileType: data.fileType,
          fileSize: data.fileSize,
          sender: "partner",
          type: "file",
          timestamp: new Date(),
        },
      ]);
    });

    socket.on("partner_typing", () => {
      setIsPartnerTyping(true);
    });

    socket.on("partner_stop_typing", () => {
      setIsPartnerTyping(false);
    });

    socket.on("user_count", (data) => {
      setUserCount(data.count);
    });

    socket.on("file_error", (data) => {
      alert(data.error);
      setUploadProgress(null);
    });

    socket.on("partner_left", () => {
      console.log("Partner left");
      setChatState("DISCONNECTED");
      setIsPartnerTyping(false);
    });

    socket.on("receive_reaction", (data) => {
      const { messageIndex, reaction } = data;
      setMessageReactions((prev) => ({
        ...prev,
        [messageIndex]: reaction,
      }));
      setTimeout(() => {
        setMessageReactions((prev) => {
          const newReactions = { ...prev };
          delete newReactions[messageIndex];
          return newReactions;
        });
      }, 3000);
    });

    return () => {
      socket.off("chat_started");
      socket.off("receive_message");
      socket.off("receive_file");
      socket.off("file_error");
      socket.off("partner_left");
      socket.off("partner_typing");
      socket.off("partner_stop_typing");
      socket.off("user_count");
      socket.off("receive_reaction");
    };
  }, [notificationSound, isSoundEnabled]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (lastAudioUrlRef.current) {
        URL.revokeObjectURL(lastAudioUrlRef.current);
        lastAudioUrlRef.current = null;
      }
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();

    if (currentMessage.trim() === "") return;

    socket.emit("stop_typing", { roomId });

    socket.emit("send_message", {
      roomId,
      message: currentMessage,
      senderId: socket.id,
    });

    setMessagesSent((prev) => prev + 1);
    setMessages((prev) => [
      ...prev,
      {
        text: currentMessage,
        sender: "me",
        type: "text",
        timestamp: new Date(),
      },
    ]);
    setCurrentMessage("");
  };

  const handleTyping = (e) => {
    setCurrentMessage(e.target.value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (e.target.value.trim() !== "") {
      socket.emit("typing", { roomId });

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop_typing", { roomId });
      }, 1000);
    } else {
      socket.emit("stop_typing", { roomId });
    }
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
          timestamp: new Date(),
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

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const skipPartner = () => {
    if (roomId) {
      socket.disconnect();
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };

  const findNewPartner = () => {
    window.location.reload();
  };

  const addEmoji = (emoji) => {
    if (currentMessage.length < MAX_MESSAGE_LENGTH) {
      setCurrentMessage((prev) => prev + emoji);
      setShowEmojiPicker(false);
    }
  };

  const copyMessage = (text, index) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedMessageIndex(index);
        setTimeout(() => setCopiedMessageIndex(null), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
      });
  };

  const getRemainingChars = () => {
    return MAX_MESSAGE_LENGTH - currentMessage.length;
  };

  const toggleSound = () => {
    setIsSoundEnabled((prev) => !prev);
  };

  const reactToMessage = (messageIndex, reaction) => {
    socket.emit("send_reaction", { roomId, messageIndex, reaction });
    setMessageReactions((prev) => ({
      ...prev,
      [messageIndex]: reaction,
    }));
    setTimeout(() => {
      setMessageReactions((prev) => {
        const newReactions = { ...prev };
        delete newReactions[messageIndex];
        return newReactions;
      });
    }, 3000);
  };

  const detectLinks = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="message-link"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case "good":
        return <img src={statusGood} alt="Connected" />;
      case "fair":
        return <img src={statusFair} alt="Slow connection" />;
      case "poor":
        return <img src={statusPoor} alt="Poor connection" />;
      default:
        return <img src={statusGood} alt="Connected" />;
    }
  };

  const getConnectionText = () => {
    switch (connectionQuality) {
      case "good":
        return "Connected";
      case "fair":
        return "Slow Connection";
      case "poor":
        return "Poor Connection";
      default:
        return "Connected";
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const closeWelcome = () => {
    localStorage.setItem("echoVisited", "true");
    setShowWelcome(false);
  };

  return (
    <>
      {showWelcome && (
        <div className="welcome-overlay">
          <div className="welcome-modal">
            <h2>
              Welcome to Echo! <img src={chatIcon} alt="Echo" />
            </h2>
            <div className="welcome-content">
              <div className="welcome-item">
                <span className="welcome-icon">
                  <img src={chatIcon} alt="Chat" />
                </span>
                <p>Chat anonymously with random strangers</p>
              </div>
              <div className="welcome-item">
                <span className="welcome-icon">
                  <img src={paperclipIcon} alt="Attach" />
                </span>
                <p>Share files, images, and videos (up to 50MB)</p>
              </div>
              <div className="welcome-item">
                <span className="welcome-icon">
                  <img src={skipIcon} alt="Skip" />
                </span>
                <p>Press ESC to skip and find a new partner</p>
              </div>
              <div className="welcome-item">
                <span className="welcome-icon">
                  <img src={emojiIcon} alt="Emoji" />
                </span>
                <p>Use emoji picker and react to messages</p>
              </div>
              <div className="welcome-item">
                <span className="welcome-icon">
                  <img src={lockIcon} alt="Safe" />
                </span>
                <p>Be respectful and enjoy safe conversations</p>
              </div>
            </div>
            <button className="welcome-btn" onClick={closeWelcome}>
              Get Started
            </button>
          </div>
        </div>
      )}

      {chatState === "SEARCHING" && (
        <div className="chat-container">
          <div className="status-text">
            <img src={searchIcon} alt="Searching" /> Searching for a partner...
          </div>
          {userCount > 0 && (
            <div className="user-count">
              <img src={userCountIcon} alt="Users" /> {userCount} users online
            </div>
          )}
        </div>
      )}

      {chatState === "CHATTING" && (
        <>
          <div className="chat-header-info">
            <div className="left-info">
              <span className="connection-status">
                {getConnectionIcon()} {getConnectionText()}
              </span>
              {userCount > 0 && (
                <span className="user-count-small">
                  <img src={userCountIcon} alt="Users" /> {userCount}
                </span>
              )}
            </div>
            <div className="header-actions">
              <button
                className="sound-toggle-btn"
                onClick={toggleSound}
                title={
                  isSoundEnabled ? "Mute notifications" : "Unmute notifications"
                }
              >
                <img
                  src={isSoundEnabled ? soundOnIcon : soundOffIcon}
                  alt={isSoundEnabled ? "Sound on" : "Sound off"}
                />
              </button>
              <button
                className="skip-btn"
                onClick={skipPartner}
                title="Find new partner (ESC)"
              >
                <img src={skipIcon} alt="Skip" /> Skip
              </button>
            </div>
          </div>
          <div className="chat-stats">
            <span className="stat-item" title="Chat duration">
              <img src={timerIcon} alt="Timer" /> {formatDuration(chatDuration)}
            </span>
            <span className="stat-item" title="Messages sent">
              <img src={sentIcon} alt="Sent" /> {messagesSent}
            </span>
            <span className="stat-item" title="Messages received">
              <img src={receivedIcon} alt="Received" /> {messagesReceived}
            </span>
          </div>
          <div className="message-list">
            {messages.map((msg, index) => (
              <div key={index} className={`message-wrapper ${msg.sender}`}>
                <div className={`message ${msg.sender}`}>
                  {msg.type === "text" ? (
                    <>
                      <span>{detectLinks(msg.text)}</span>
                      <button
                        className="speak-btn"
                        onClick={() => speakMessage(msg.text, index)}
                        title="Read message aloud"
                      >
                        {ttsLoadingIndex === index ? (
                          <img
                            src={require("../assets/icons/loader.svg")}
                            alt="Loading"
                          />
                        ) : speakingMessageIndex === index ? (
                          <img src={stopIcon} alt="Stop" />
                        ) : (
                          <img src={speakerIcon} alt="Speak" />
                        )}
                      </button>
                      <button
                        className="copy-btn"
                        onClick={() => copyMessage(msg.text, index)}
                        title="Copy message"
                      >
                        <img
                          src={
                            copiedMessageIndex === index ? checkIcon : copyIcon
                          }
                          alt={copiedMessageIndex === index ? "Copied" : "Copy"}
                        />
                      </button>
                    </>
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
                          <span className="file-icon">
                            <img src={paperclipIcon} alt="File" />
                          </span>
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
                        <img src={downloadIcon} alt="Download" /> Download
                      </button>
                    </div>
                  )}
                </div>
                <div className="message-footer">
                  <span className="message-timestamp">
                    {formatTime(msg.timestamp)}
                  </span>
                  {msg.type === "text" && (
                    <div className="reaction-buttons">
                      <button
                        className="react-btn"
                        onClick={() => reactToMessage(index, "👍")}
                        title="Like"
                      >
                        <img src={likeIcon} alt="Like" />
                      </button>
                      <button
                        className="react-btn"
                        onClick={() => reactToMessage(index, "❤️")}
                        title="Love"
                      >
                        <img src={loveIcon} alt="Love" />
                      </button>
                      <button
                        className="react-btn"
                        onClick={() => reactToMessage(index, "😂")}
                        title="Laugh"
                      >
                        <img src={laughIcon} alt="Laugh" />
                      </button>
                    </div>
                  )}
                </div>
                {messageReactions[index] && (
                  <div className="reaction-display">
                    {messageReactions[index]}
                  </div>
                )}
              </div>
            ))}
            {isPartnerTyping && (
              <div className="typing-indicator">
                <span>Partner is typing</span>
                <span className="typing-dots">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {showEmojiPicker && (
            <div className="emoji-picker">
              <div className="emoji-header">
                <span>Select an emoji</span>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(false)}
                  className="close-emoji"
                >
                  ✕
                </button>
              </div>
              <div className="emoji-grid">
                {emojis.map((emoji, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="emoji-item"
                    onClick={() => addEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
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
              <img src={paperclipIcon} alt="Attach" />
            </button>
            <button
              type="button"
              className="emoji-btn"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="Add emoji"
            >
              <img src={emojiIcon} alt="Emoji" />
            </button>
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Type a message..."
                value={currentMessage}
                onChange={handleTyping}
                maxLength={MAX_MESSAGE_LENGTH}
              />
              <span
                className={`char-counter ${
                  getRemainingChars() < 50 ? "warning" : ""
                }`}
              >
                {getRemainingChars()}
              </span>
            </div>
            <button type="submit" disabled={currentMessage.trim() === ""}>
              Send
            </button>
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
          <div className="status-text">Your partner has left the chat</div>
          <button className="find-new-btn" onClick={findNewPartner}>
            Find a New Partner
          </button>
        </div>
      )}
    </>
  );
}

export default Chat;
