# Quick Setup Guide

## Required Information

You'll need the following from your Supabase project:

1. **Supabase Project URL**: Found in your Supabase project settings (e.g., `https://btnqcjrwcdirjhggyhne.supabase.co`)
2. **Supabase Anon Key**: Found in your Supabase project API settings
3. **Storage Credentials**: Already provided:
   - Access Key: `d8f8841daf6c976a42f6d69f59b25dfd`
   - Secret Key: `d888b8e7fb74310ab98ed6fff83808c143401eb9cb25739e71ac4efcf6232ea8`
   - Endpoint: `https://btnqcjrwcdirjhggyhne.storage.supabase.co/storage/v1/s3`

## .env File Template

Create a `.env` file in the root directory:

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=8400113883:AAEHiVxusXmbDPNfaTdtA8F4tMR--ACE2ew

# Admin Panel
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here
SESSION_SECRET=generate_random_string_here

# Supabase Database
SUPABASE_URL=https://btnqcjrwcdirjhggyhne.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Supabase Storage (S3-compatible)
SUPABASE_S3_ACCESS_KEY=d8f8841daf6c976a42f6d69f59b25dfd
SUPABASE_S3_SECRET_KEY=d888b8e7fb74310ab98ed6fff83808c143401eb9cb25739e71ac4efcf6232ea8
SUPABASE_S3_ENDPOINT=https://btnqcjrwcdirjhggyhne.storage.supabase.co/storage/v1/s3
SUPABASE_S3_BUCKET=screenshots

# Server
PORT=3000
```

## Steps to Complete Setup

1. **Get Supabase Anon Key**:
   - Go to your Supabase project dashboard
   - Navigate to Settings → API
   - Copy the "anon" or "public" key

2. **Create Database Table**:
   - Go to SQL Editor in Supabase
   - Run the SQL from `supabase-schema.sql`

3. **Create Storage Bucket**:
   - Go to Storage in Supabase dashboard
   - Create a new bucket named `screenshots`
   - Make it **public** (enable public access)

4. **Set Admin Password**:
   - Choose a secure password for `ADMIN_PASSWORD`
   - Generate a random `SESSION_SECRET` (you can use: `openssl rand -hex 32`)

5. **Install and Run**:
   ```bash
   npm install
   npm run dev
   ```

6. **Test**:
   - Send `/start` to your Telegram bot
   - Send a screenshot
   - Visit `http://localhost:3000/admin` and login

