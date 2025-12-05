# Netlify Deployment Guide

## Quick Deploy Steps

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Connect to Netlify**:
   - Go to [Netlify](https://app.netlify.com)
   - Click "New site from Git"
   - Select your repository

3. **Set Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist/public` (or leave empty, netlify.toml handles it)

4. **Set Environment Variables** in Netlify Dashboard:
   Go to Site settings → Environment variables and add:
   ```
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
   USE_WEBHOOK=true
   ```

5. **Deploy** - Netlify will automatically build and deploy

6. **Set up Telegram Webhook**:
   After deployment, get your Netlify URL (e.g., `https://your-site.netlify.app`)
   Run:
   ```bash
   npm run setup-webhook https://your-site.netlify.app/.netlify/functions/webhook
   ```
   
   Or manually set it via Telegram API:
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-site.netlify.app/.netlify/functions/webhook"
   ```

## File Structure

```
├── netlify/
│   └── functions/
│       ├── webhook.ts      # Telegram webhook handler
│       ├── admin.ts        # Admin panel routes
│       └── api.ts          # API routes
├── src/
│   ├── bot/
│   ├── routes/
│   ├── services/
│   └── config.ts           # Centralized config
├── public/                 # Static files (admin panel)
├── netlify.toml           # Netlify configuration
└── package.json
```

## Important Notes

- The bot uses **webhook mode** on Netlify (not polling)
- Sessions are stored in-memory (not persistent across function invocations)
- For production, consider using a proper session store (Redis, etc.)
- Make sure `tgbot.mp4` is included in your repository

## Troubleshooting

- **Bot not responding**: Check webhook is set correctly
- **Functions not found**: Ensure build completed successfully
- **Session issues**: Sessions reset on each function invocation (expected behavior)
