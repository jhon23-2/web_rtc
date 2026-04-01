# Deployment Guide - WebRTC Application

This guide will help you deploy your WebRTC application to Render.com (free tier).

## Prerequisites

1. A GitHub account
2. A Render.com account (sign up at https://render.com)

## Step 1: Prepare Your Repository

1. Make sure your code is pushed to a GitHub repository
2. Ensure all files are committed

## Step 2: Deploy to Render.com

### Option A: Using Render Dashboard (Recommended)

1. **Sign in to Render**
   - Go to https://render.com and sign in

2. **Create a New Web Service**
   - Click "New +" button
   - Select "Web Service"
   - Connect your GitHub repository

3. **Configure the Service**
   - **Name**: `web-rtc-app` (or any name you prefer)
   - **Environment**: `Node`
   - **Region**: Choose closest to you
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty (root of repo)
   - **Build Command**: `npm install && npm run build-client`
   - **Start Command**: `npm start`

4. **Set Environment Variables**
   Click "Advanced" and add:
   - `NODE_ENV` = `production`
   - `SERVER_PORT` = `10000` (Render uses port 10000)
   - `CLIENT_URL` = Leave empty initially, will auto-update

5. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete (5-10 minutes first time)

### Option B: Using render.yaml (Alternative)

If you prefer using the `render.yaml` file:
1. Push the `render.yaml` file to your repo
2. In Render dashboard, select "New +" → "Blueprint"
3. Connect your repository
4. Render will automatically detect and use the `render.yaml` file

## Step 3: Update Environment Variables After Deployment

After your service is deployed:

1. Go to your service settings in Render
2. Navigate to "Environment"
3. Update `CLIENT_URL` to your actual Render URL:
   - Format: `https://your-app-name.onrender.com`
   - Example: `https://web-rtc-app.onrender.com`

## Step 4: Update Client Environment Variable

The client needs to know the server URL. Since we're serving everything from one service:

1. The `VITE_SOCKET_URL` will automatically use the same domain
2. If you need to override, create a `.env` file in the `client` folder:
   ```
   VITE_SOCKET_URL=https://your-app-name.onrender.com
   ```

## Important Notes

### Free Tier Limitations

- **Spins down after 15 minutes of inactivity**: First request after spin-down takes ~30 seconds
- **750 hours/month free**: Enough for testing
- **Auto-deploy**: Enabled by default on git push

### WebRTC Considerations

- **HTTPS Required**: Render provides HTTPS automatically
- **STUN/TURN Servers**: You may need to configure TURN servers for users behind strict firewalls
- **Port**: Render uses port 10000 internally, but you access via HTTPS on port 443

### Testing Your Deployment

1. Visit your Render URL: `https://your-app-name.onrender.com`
2. Create a room
3. Open the same URL in an incognito window
4. Join the same room
5. Test video/audio and chat functionality

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Socket Connection Issues
- Check that `CLIENT_URL` environment variable is set correctly
- Verify CORS settings in `index.js`
- Check browser console for connection errors

### WebRTC Not Working
- Ensure HTTPS is enabled (Render does this automatically)
- Check browser permissions for camera/microphone
- Some networks/firewalls may block WebRTC

## Alternative Free Hosting Options

If Render doesn't work for you:

1. **Railway.app** - Similar to Render, free tier available
2. **Fly.io** - Good for WebRTC apps
3. **Heroku** - Requires credit card but has free tier
4. **Vercel** (Frontend) + **Render** (Backend) - Split deployment

## Support

For issues specific to:
- **Render**: Check Render documentation at https://render.com/docs
- **WebRTC**: Check browser console and network tab
- **Socket.IO**: Verify connection in browser DevTools → Network → WS

