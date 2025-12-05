# ⚡ Render Deployment - Quick Start Guide

## 🚀 Fast Deployment (5 Minutes)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### Step 2: Create Render Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub and select your repository
4. Use these settings:

**Basic Settings:**
- Name: `telegram-bot-vantage`
- Environment: `Node`
- Plan: `Free`

**Build & Deploy:**
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

### Step 3: Add Environment Variables

Go to **Environment** tab and add these (copy from your `.env` file):

```env
NODE_ENV=production
PORT=10000
USE_WEBHOOK=false
TELEGRAM_BOT_TOKEN=8400113883:AAEHiVxusXmbDPNfaTdtA8F4tMR--ACE2ew
ADMIN_USERNAME=admin
ADMIN_PASSWORD=sameer337788
SESSION_SECRET=0d68bf8e4306e670089e21fedc71b402bd0b38d13f2e1b21f0f9761d6154e4a3
SUPABASE_URL=https://btnqcjrwcdirjhggyhne.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0bnFjanJ3Y2RpcmpoZ2d5aG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxODc3MzYsImV4cCI6MjA3OTc2MzczNn0.fbKa_hmN3ffS1GjreoTExtpfcT9vITZciakRgwbqYtE
SUPABASE_S3_ACCESS_KEY=d8f8841daf6c976a42f6d69f59b25dfd
SUPABASE_S3_SECRET_KEY=d888b8e7fb74310ab98ed6fff83808c143401eb9cb25739e71ac4efcf6232ea8
SUPABASE_S3_ENDPOINT=https://btnqcjrwcdirjhggyhne.storage.supabase.co/storage/v1/s3
SUPABASE_S3_BUCKET=screenshots
```

### Step 4: Deploy!

1. Click **"Create Web Service"**
2. Wait 2-3 minutes for build
3. Your bot URL will be: `https://telegram-bot-vantage.onrender.com`

### Step 5: Test

✅ Visit: `https://your-app.onrender.com/health` → Should show `{"status":"ok"}`

✅ Visit: `https://your-app.onrender.com/admin` → Login with admin credentials

✅ Test bot on Telegram: Send `/start` to your bot

## ⚠️ Important Notes

1. **Free Tier**: Bot sleeps after 15 min inactivity (first message takes ~30 sec)
2. **Video File**: Make sure `tgbot.mp4` is in your repository
3. **Environment Variables**: Copy EXACTLY from your `.env` file (no quotes)

## 📖 Detailed Guide

For complete setup instructions, see: `RENDER_DEPLOY_GUIDE.md`

## 🆘 Troubleshooting

- **Build fails?** Check logs in Render Dashboard
- **Bot not responding?** Check `TELEGRAM_BOT_TOKEN` is correct
- **Port error?** Render sets PORT automatically, don't hardcode

---

**That's it! Your bot is live! 🎉**

