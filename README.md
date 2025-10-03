# Echo - Real-Time Anonymous Chat App

A modern, real-time anonymous chat application that pairs random strangers for one-on-one conversations. Built with React and Socket.IO.

## 🌟 Features

- **Instant Pairing**: Get matched with a random stranger in seconds
- **Real-Time Messaging**: Lightning-fast message delivery using Socket.IO
- **Media Sharing**: Share images, videos, and files up to 50MB
- **Smart Previews**: Inline image/video previews with download capability
- **Anonymous Chatting**: No registration, no tracking - just chat
- **Modern UI**: Beautiful dark-themed interface with gradient accents
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Ephemeral Storage**: All files deleted when chat ends (privacy-first)

## 🏗️ Architecture

- **Frontend**: React application with Socket.IO client
- **Backend**: Node.js/Express server with Socket.IO
- **Real-Time Communication**: Bidirectional WebSocket connections

## 📁 Project Structure

```
/Echo
├── /backend          # Node.js/Express Server
│   ├── index.js      # Server logic & Socket.IO handlers
│   └── package.json  # Backend dependencies
│
└── /frontend         # React App
    ├── /public
    └── /src
        ├── /components
        │   └── Chat.js     # Main chat component
        ├── App.js          # App wrapper
        ├── App.css         # Styling
        └── index.js        # Entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation & Running

#### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

#### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

#### 3. Start the Backend Server

```bash
cd backend
npm start
```

The server will start on **http://localhost:5001**

#### 4. Start the Frontend (in a new terminal)

```bash
cd frontend
npm start
```

The React app will open in your browser at **http://localhost:3000**

## 🧪 Testing the App

1. Open **http://localhost:3000** in two separate browser windows or tabs
2. The first window will show "🔍 Searching for a partner..."
3. When the second window connects, both users will be paired and can start chatting
4. Send messages back and forth to test the real-time communication
5. Close one window - the other should display "😔 Your partner has left the chat"
6. Click "Find a New Partner" to restart the connection

## 🛠️ Technologies Used

### Backend

- **Express.js** - Web framework
- **Socket.IO** - Real-time bidirectional communication
- **CORS** - Cross-origin resource sharing
- **Nodemon** - Auto-restart during development

### Frontend

- **React** - UI library
- **Socket.IO Client** - WebSocket client
- **Poppins Font** - Modern typography

## 📡 Socket.IO Events

### Client → Server

- `send_message` - Send a text message to the chat partner
  - Payload: `{ roomId, message, senderId }`
- `send_file` - Send a file to the chat partner
  - Payload: `{ roomId, file, fileName, fileType, fileSize, senderId }`

### Server → Client

- `chat_started` - Notifies users they've been paired
  - Payload: `{ roomId }`
- `receive_message` - Receive a text message from chat partner
  - Payload: `{ message, senderId }`
- `receive_file` - Receive a file from chat partner
  - Payload: `{ file, fileName, fileType, fileSize, senderId }`
- `file_error` - File upload error (e.g., size exceeded)
  - Payload: `{ error }`
- `partner_left` - Partner disconnected from chat

## 🎨 UI States

The app has three main states:

1. **SEARCHING** - Looking for a chat partner
2. **CHATTING** - Active conversation with a partner
3. **DISCONNECTED** - Partner has left the chat

## 🔒 Privacy

- No data is stored or logged permanently
- All conversations and files are ephemeral (exist only in memory)
- Files automatically deleted when chat ends or server restarts
- Complete anonymity - no user accounts or identifiers
- No file metadata tracking

## 📎 Media Sharing

- **File Upload**: Click the 📎 button to attach any file
- **Size Limit**: Maximum 50MB per file
- **Supported Types**: Images, videos, documents, archives, and more
- **Smart Previews**:
  - Images display inline with click-to-download
  - Videos play directly in chat
  - Other files show icon with filename and size
- **Download**: All shared files can be downloaded by clicking the download button

## 🐛 Known Issues

- None currently! If you find any, please report them.

## 📝 Future Enhancements

- [ ] Add typing indicators
- [ ] Implement "Next" button to skip current partner
- [ ] Add emoji picker
- [ ] Include language preferences
- [ ] Add reporting/moderation features
- [ ] Implement chat history (session-only)
- [ ] File encryption for enhanced privacy
- [ ] Voice and video calling
- [ ] Group chat rooms

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

Created with ❤️ for anonymous conversations

## 📸 Screenshots

_Add screenshots of your app here_

---

**Enjoy chatting anonymously with Echo! 🎭💬**
