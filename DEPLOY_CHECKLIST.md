# Netlify Deployment Checklist ✅

## Before Deploying

- [ ] All environment variables are ready (see NETLIFY_DEPLOY.md)
- [ ] `tgbot.mp4` file is in the root directory
- [ ] All code changes are committed

## Deploy Steps

1. **Push to Git** (GitHub/GitLab/Bitbucket)

2. **Connect to Netlify**:
   - Go to https://app.netlify.com
   - New site → Import from Git
   - Select your repository

3. **Set Environment Variables** in Netlify:
   ```
   TELEGRAM_BOT_TOKEN
   ADMIN_USERNAME
   ADMIN_PASSWORD
   SESSION_SECRET
   SUPABASE_URL
   SUPABASE_ANON_KEY
   SUPABASE_S3_ACCESS_KEY
   SUPABASE_S3_SECRET_KEY
   SUPABASE_S3_ENDPOINT
   SUPABASE_S3_BUCKET
   USE_WEBHOOK=true
   ```

4. **Deploy** - Netlify will auto-build

5. **Set Webhook** after deployment:
   ```bash
   npm run setup-webhook https://your-site.netlify.app/.netlify/functions/webhook
   ```

## That's It! 🎉

Your bot should now be live on Netlify!
