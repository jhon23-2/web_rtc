# Quick Deployment Guide - Render.com

## 🚀 Fast Track (5 minutes)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Deploy on Render

1. Go to https://render.com and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Fill in:
   - **Name**: `web-rtc-app`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build-client`
   - **Start Command**: `npm start`
5. Click **"Advanced"** and add environment variables:
   - `NODE_ENV` = `production`
   - `SERVER_PORT` = `10000`
6. Click **"Create Web Service"**
7. Wait 5-10 minutes for first build

### Step 3: Update CLIENT_URL (After First Deploy)

Once deployed, you'll get a URL like: `https://web-rtc-app.onrender.com`

1. Go to your service → **Environment**
2. Add: `CLIENT_URL` = `https://web-rtc-app.onrender.com` (use YOUR actual URL)
3. Save changes (will auto-redeploy)

### Step 4: Test!

Visit your URL and test the app! 🎉

---

## 📝 What Changed for Deployment

✅ Server now serves React build files in production  
✅ Socket URL auto-detects in production  
✅ Environment variables configured  
✅ Build scripts added to package.json  
✅ CORS configured for production  

## ⚠️ Important Notes

- **Free tier spins down after 15 min inactivity** - first request takes ~30 seconds
- **HTTPS is automatic** - required for WebRTC
- **Port 10000** - Render uses this internally, you access via HTTPS

## 🐛 Troubleshooting

**Build fails?**
- Check Render logs
- Ensure all dependencies are in package.json

**Socket not connecting?**
- Verify CLIENT_URL is set correctly
- Check browser console for errors

**WebRTC not working?**
- Ensure HTTPS (automatic on Render)
- Check browser permissions
- Some networks block WebRTC

---

For detailed instructions, see `DEPLOYMENT.md`

