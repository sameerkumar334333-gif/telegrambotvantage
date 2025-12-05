# 🚀 Complete Render Deployment Guide

## 📋 Overview

This guide will help you deploy your Telegram bot backend to Render. The bot handles:
- Telegram bot interactions (receiving messages, sending videos)
- Admin panel API endpoints
- Image upload to Supabase Storage
- Database operations

## ✅ Prerequisites

Before deploying, make sure you have:
- ✅ GitHub account
- ✅ Render account (free tier works)
- ✅ Supabase project set up
- ✅ Telegram Bot Token from [@BotFather](https://t.me/botfather)
- ✅ All credentials ready

## 📦 Step 1: Prepare Your Repository

### 1.1 Push Code to GitHub

If your code is not on GitHub yet:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Ready for Render deployment"

# Add GitHub remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/telegram-bot-vantage.git

# Push to GitHub
git push -u origin main
```

### 1.2 Verify Files Structure

Make sure these files are in your repository:
```
telegram-bot-vantage/
├── src/
│   ├── bot/
│   │   └── bot.ts
│   ├── routes/
│   ├── services/
│   └── server.ts
├── public/
├── package.json
├── tsconfig.json
├── tgbot.mp4          # ⚠️ Important: Welcome video
└── render.yaml        # Optional: Render config
```

## 🔧 Step 2: Render Dashboard Setup

### 2.1 Create New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** button
3. Select **"Web Service"**
4. Connect your GitHub repository
5. Select the repository: `telegram-bot-vantage`

### 2.2 Configure Build Settings

**Basic Settings:**
- **Name**: `telegram-bot-vantage` (or any name you prefer)
- **Environment**: `Node`
- **Region**: Choose closest to you
- **Branch**: `main` (or your default branch)
- **Plan**: `Free` (or upgrade if needed)

**Build & Deploy:**
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Root Directory**: (leave empty, or use `.` if needed)

### 2.3 Environment Variables

Click on **"Environment"** tab and add these variables:

```env
NODE_ENV=production
PORT=10000
USE_WEBHOOK=false

# Telegram Bot
TELEGRAM_BOT_TOKEN=8400113883:AAEHiVxusXmbDPNfaTdtA8F4tMR--ACE2ew

# Admin Panel
ADMIN_USERNAME=admin
ADMIN_PASSWORD=sameer337788
SESSION_SECRET=0d68bf8e4306e670089e21fedc71b402bd0b38d13f2e1b21f0f9761d6154e4a3

# Supabase Database
SUPABASE_URL=https://btnqcjrwcdirjhggyhne.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0bnFjanJ3Y2RpcmpoZ2d5aG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxODc3MzYsImV4cCI6MjA3OTc2MzczNn0.fbKa_hmN3ffS1GjreoTExtpfcT9vITZciakRgwbqYtE

# Supabase Storage (S3-compatible)
SUPABASE_S3_ACCESS_KEY=d8f8841daf6c976a42f6d69f59b25dfd
SUPABASE_S3_SECRET_KEY=d888b8e7fb74310ab98ed6fff83808c143401eb9cb25739e71ac4efcf6232ea8
SUPABASE_S3_ENDPOINT=https://btnqcjrwcdirjhggyhne.storage.supabase.co/storage/v1/s3
SUPABASE_S3_BUCKET=screenshots
```

**Important Notes:**
- Copy these EXACTLY from your `.env` file
- Don't use quotes around values
- Make sure `USE_WEBHOOK=false` (we use polling mode on Render)

### 2.4 Advanced Settings (Optional)

**Auto-Deploy:**
- ✅ Enable **"Auto-Deploy"** if you want automatic deployments on push

**Health Check Path:**
- Add: `/health` (optional, but recommended)

## 🚀 Step 3: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies (`npm install`)
   - Build the project (`npm run build`)
   - Start the server (`npm start`)

3. Watch the build logs to ensure everything works

## ✅ Step 4: Verify Deployment

### 4.1 Check Build Logs

Look for these success messages:
```
✓ Build completed successfully
✓ Server is running on port 10000
✓ Telegram bot is running in polling mode...
```

### 4.2 Test Your Bot

1. Your Render URL will be: `https://telegram-bot-vantage.onrender.com`
2. Visit: `https://your-app-name.onrender.com/health`
   - Should return: `{"status":"ok"}`

### 4.3 Test Admin Panel

1. Visit: `https://your-app-name.onrender.com/admin`
2. Login with:
   - Username: `admin`
   - Password: `sameer337788`

### 4.4 Test Telegram Bot

1. Open Telegram
2. Find your bot (search by bot username)
3. Send `/start` command
4. Bot should:
   - Send welcome video
   - Ask for UID
   - Process screenshots

## 🔍 Step 5: Monitor & Troubleshoot

### View Logs

1. Go to Render Dashboard
2. Click on your service
3. Go to **"Logs"** tab
4. Check for errors

### Common Issues

#### ❌ Build Fails

**Error**: `Cannot find module`
- **Solution**: Make sure `package.json` has all dependencies
- Check build logs for missing packages

#### ❌ Bot Not Responding

**Error**: Bot doesn't reply to messages
- **Check**: `TELEGRAM_BOT_TOKEN` is correct
- **Check**: Logs show "Telegram bot is running in polling mode..."
- **Check**: Bot is not blocked

#### ❌ Port Already in Use

**Error**: `Port 10000 already in use`
- **Solution**: Render automatically sets PORT, don't hardcode it
- Make sure `server.ts` uses `process.env.PORT || 3000`

#### ❌ Video Not Sending

**Error**: Video file not found
- **Check**: `tgbot.mp4` is in repository root
- **Check**: File is committed to git (not in .gitignore)
- **Check**: Build process copies video to `dist/` folder

#### ❌ Database Errors

**Error**: Supabase connection failed
- **Check**: `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- **Check**: Supabase project is active
- **Check**: Database table exists

## 📝 Step 6: Important Notes

### Free Tier Limitations

- **Sleeps after 15 minutes** of inactivity
- First request after sleep takes ~30 seconds (cold start)
- Bot will auto-wake when it receives a message

### Upgrading to Paid Plan

To keep bot always active:
1. Go to Render Dashboard
2. Click on your service
3. Go to **"Settings"**
4. Upgrade to **"Starter"** plan ($7/month)

### Webhook vs Polling

- **Current Setup**: Polling mode (`USE_WEBHOOK=false`)
- **Why**: Easier to set up, works with free tier
- **Alternative**: Webhook mode (requires always-on service)

### Environment Variables Security

- ✅ Never commit `.env` file to git
- ✅ Use Render's environment variables
- ✅ Rotate secrets regularly

## 🔄 Step 7: Update Bot (After Changes)

1. Make changes to your code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your update message"
   git push
   ```
3. Render will auto-deploy (if enabled)
4. Or manually redeploy from Render Dashboard

## 📊 Monitoring

### Check Service Status

- Go to Render Dashboard
- Service shows:
  - ✅ **Live** (running)
  - 😴 **Suspended** (sleeping on free tier)
  - ❌ **Failed** (check logs)

### View Metrics

- **Metrics** tab shows:
  - CPU usage
  - Memory usage
  - Request count

## 🎯 Final Checklist

Before considering deployment complete:

- [ ] Bot responds to `/start` command
- [ ] Welcome video is sent
- [ ] Bot accepts UID input
- [ ] Bot accepts screenshot uploads
- [ ] Admin panel is accessible
- [ ] Can login to admin panel
- [ ] Submissions appear in admin panel
- [ ] Can update submission status
- [ ] Health check endpoint works (`/health`)

## 🆘 Support

If you face issues:

1. **Check Render Logs**: Most errors show in logs
2. **Check Bot Logs**: Look for Telegram API errors
3. **Verify Environment Variables**: Make sure all are set correctly
4. **Test Locally**: Try running `npm run dev` locally first

## 🎉 Success!

Once everything is working:
- Your bot is live on Render!
- Admin panel: `https://your-app.onrender.com/admin`
- Bot is ready to receive messages on Telegram

---

**Need Help?** Check the logs first, most issues are visible there!

