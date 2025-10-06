# Echo — Anonymous Real‑Time Chat

Anonymous, one‑to‑one chat with instant pairing, file sharing, reactions, and optional text‑to‑speech playback. Built with React + Socket.IO (frontend) and Express + Socket.IO (backend).

## ✨ Features

- Instant pairing with a random stranger
- Real‑time messaging with delivery over WebSockets
- File sharing up to 50MB (images/videos show inline previews)
- Reactions and emoji picker
- Text‑to‑speech for messages (server‑side synthesis)
- Connection quality indicator and online user count
- Clean, responsive UI with professional SVG icons
- No sign‑up; ephemeral, privacy‑first interactions

## 🧭 Monorepo Layout

```
Echo/
├─ backend/                      # Node.js / Express API + Socket.IO
│  ├─ index.js                   # App bootstrap (Express + Socket.IO)
│  └─ src/
│     ├─ routes/
│     │  └─ tts.js              # POST /api/synthesize-speech (audio bytes)
│     ├─ services/
│     │  └─ ttsService.js       # Azure Speech SDK synthesis
│     └─ sockets/
│        └─ matchmaking.js      # Pairing, messaging, files, typing, reactions
│
└─ frontend/                     # React application
   ├─ public/
   └─ src/
      ├─ components/
      │  └─ Chat.js             # Main chat UI (icons, TTS controls)
      ├─ assets/
      │  └─ icons/              # Professional SVG icons
      ├─ App.js / App.css
      └─ index.js
```

## ⚙️ Requirements

- Node.js 16+ (LTS recommended)
- npm 8+

## 🔑 Environment Variables

Backend (backend/.env):

```
SPEECH_KEY=your-azure-cognitive-services-key
SPEECH_REGION=your-azure-region           # e.g. eastus
FRONTEND_URL=http://localhost:3000        # for CORS during local dev
PORT=5001
```

Frontend (frontend/.env):

```
REACT_APP_BACKEND_URL=http://localhost:5001
```

Note: In production, ensure BOTH apps use HTTPS to avoid browser mixed‑content blocking (frontend https calling backend http will be blocked).

## ▶️ Run Locally

Windows PowerShell examples below (run in two terminals):

Backend

```powershell
cd backend
npm install
npm run dev   # or: npm start
```

Frontend

```powershell
cd frontend
npm install
npm start
```

Defaults

- API: http://localhost:5001
- Web: http://localhost:3000

## 🔌 API

POST /api/synthesize-speech

- Body: `{ "text": "Hello world" }`
- Response: audio/mpeg bytes (MP3)
- Errors: 400 invalid input, 500 synthesis/config errors

## 📡 Socket.IO Events

Client → Server

- `send_message` → `{ roomId, message, senderId }`
- `send_file` → `{ roomId, file, fileName, fileType, fileSize, senderId }`
- `typing` → `{ roomId }`
- `stop_typing` → `{ roomId }`
- `send_reaction` → `{ roomId, messageIndex, reaction }`

Server → Client

- `chat_started` → `{ roomId }`
- `receive_message` → `{ message, senderId }`
- `receive_file` → `{ file, fileName, fileType, fileSize, senderId }`
- `file_error` → `{ error }`
- `partner_typing`
- `partner_stop_typing`
- `receive_reaction` → `{ messageIndex, reaction }`
- `partner_left`
- `user_count` → `{ count }`

## �️ Privacy

- No persistent storage for messages or files
- Files exist only in memory during the session and are not stored to disk
- No user registration or personal data collection

## � Deploy

Frontend (Vercel, Netlify, etc.)

- Set `REACT_APP_BACKEND_URL` to your backend HTTPS URL.

Backend (Render, Railway, Azure, etc.)

- Set `SPEECH_KEY`, `SPEECH_REGION`, and optionally `FRONTEND_URL` for CORS.
- Ensure HTTPS termination is enabled or served behind a proxy.

## 🧰 Troubleshooting

- Port already in use (EADDRINUSE):
  - Stop existing process on port 5001 or set a different `PORT` in backend/.env.
- Mixed content blocked (TTS not working over HTTPS):
  - Use an HTTPS backend URL in `REACT_APP_BACKEND_URL` when deploying the frontend over HTTPS.
- CORS errors:
  - Ensure `FRONTEND_URL` is set to your deployed frontend origin in backend environment.
- TTS 500 errors:
  - Verify `SPEECH_KEY` and `SPEECH_REGION` are correct and the resource is active.

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m "feat: add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

## 📄 License

MIT © Echo

## 📸 Screenshots

Add screenshots or GIFs here showcasing pairing, chat, file sharing, and TTS.

—

Enjoy anonymous conversations with Echo 💬
