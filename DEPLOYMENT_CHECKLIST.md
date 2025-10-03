# 🚀 Quick Deployment Checklist

## ✅ Pre-Deployment (Completed)

- [x] Code cleaned and ready for production
- [x] Environment variables configured
- [x] CORS settings updated for production
- [x] Frontend configured to use environment variable for backend URL
- [x] Package.json scripts updated
- [x] Deployment configuration files created:
  - [x] `backend/Procfile` for Render
  - [x] `frontend/vercel.json` for Vercel
  - [x] `backend/.env.example`
  - [x] `frontend/.env.example`
- [x] All changes committed to Git

## 📤 Push to GitHub

```bash
cd c:\Users\omjai\Documents\Projects\Echo
git push origin main
```

## 🔧 Deploy Backend to Render

### Quick Steps:

1. **Go to**: https://dashboard.render.com/
2. **Click**: New + → Web Service
3. **Connect**: Your GitHub repo `omjain-12/Echo-An-anonymous-chatting`
4. **Configure**:
   - Name: `echo-chat-backend`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. **Environment Variables**:
   - Leave `FRONTEND_URL` empty for now
   - Add `NODE_ENV` = `production`
6. **Deploy** and wait for build to complete
7. **Copy** your backend URL (e.g., `https://echo-chat-backend-xxxx.onrender.com`)

## 🎨 Deploy Frontend to Vercel

### Quick Steps:

1. **Go to**: https://vercel.com/dashboard
2. **Click**: Add New → Project
3. **Import**: Your GitHub repo `omjain-12/Echo-An-anonymous-chatting`
4. **Configure**:
   - Framework: Create React App
   - Root Directory: `frontend`
5. **Environment Variables**:
   - Name: `REACT_APP_BACKEND_URL`
   - Value: `https://echo-chat-backend-xxxx.onrender.com` (your Render URL)
6. **Deploy** and wait for build to complete
7. **Copy** your frontend URL (e.g., `https://echo-chat-xxxx.vercel.app`)

## 🔄 Update Backend with Frontend URL

1. **Go back to Render** dashboard
2. **Select** your backend service
3. **Click** Environment tab
4. **Update** `FRONTEND_URL` with your Vercel URL
5. **Save** - Render will auto-redeploy

## ✅ Test Your Deployment

1. Open your Vercel URL in **two browser windows**
2. Wait for pairing
3. Test messaging
4. Test file sharing
5. Test disconnection

## 🎯 Your URLs

After deployment, you'll have:

**Frontend**: `https://echo-chat-xxxx.vercel.app`
**Backend**: `https://echo-chat-backend-xxxx.onrender.com`

---

## 📋 Environment Variables Reference

### Render (Backend)
```
FRONTEND_URL=https://your-vercel-url.vercel.app
NODE_ENV=production
```

### Vercel (Frontend)
```
REACT_APP_BACKEND_URL=https://your-render-url.onrender.com
```

---

## 🐛 Troubleshooting

### Connection Issues?
- Check browser console (F12) for errors
- Verify environment variables are correct
- Wait 1-2 minutes after changing env vars
- Check Render logs for backend errors

### CORS Errors?
- Make sure FRONTEND_URL in Render is exact (no trailing slash)
- Redeploy backend after updating FRONTEND_URL

### Render Service Sleeping? (Free Tier)
- First request takes 30-50 seconds to wake up
- This is normal on free tier
- Consider upgrading to Starter plan for always-on

---

## 📚 Full Documentation

See **DEPLOYMENT_GUIDE.md** for detailed step-by-step instructions with screenshots and troubleshooting.

---

**Ready to deploy? Follow the steps above! 🚀**
