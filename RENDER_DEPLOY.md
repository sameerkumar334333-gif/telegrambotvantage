# Render Deployment Guide

## Quick Deploy Steps

1. **Push your code to GitHub**

2. **Connect to Render**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure Build Settings**:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: `Node`
   - **Node Version**: `18` or `20`

4. **Set Environment Variables** in Render Dashboard:
   Go to Environment tab and add:
   ```
   NODE_ENV=production
   TELEGRAM_BOT_TOKEN=your_bot_token
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your_secure_password
   SESSION_SECRET=your_random_secret
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_S3_ACCESS_KEY=your_s3_access_key
   SUPABASE_S3_SECRET_KEY=your_s3_secret_key
   SUPABASE_S3_ENDPOINT=your_s3_endpoint
   SUPABASE_S3_BUCKET=screenshots
   PORT=10000
   USE_WEBHOOK=false
   ```

5. **Deploy** - Render will automatically build and deploy

## Important Notes

- **PORT**: Render automatically sets PORT, but you can use `10000` as default
- **USE_WEBHOOK**: Set to `false` for Render (uses polling mode)
- The bot will use **polling mode** on Render (not webhook)
- Make sure `tgbot.mp4` is in your repository

## Troubleshooting

- **Build fails**: Check that all dependencies are in package.json
- **Module not found**: Ensure build command runs successfully
- **Port issues**: Render sets PORT automatically, don't hardcode it
