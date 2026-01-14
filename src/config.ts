import dotenv from 'dotenv';

dotenv.config();

// Configuration helper that works with both .env and Netlify environment variables
export const config = {
  // Telegram Bot - DIRECT TOKEN (Updated)
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '8400113883:AAEHiVxusXmbDPNfaTdtA8F4tMR--ACE2ew',
  
  // Admin Panel
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'sameer337788',
  sessionSecret: process.env.SESSION_SECRET || '0d68bf8e4306e670089e21fedc71b402bd0b38d13f2e1b21f0f9761d6154e4a3',
  
  // Supabase Database
  supabaseUrl: process.env.SUPABASE_URL || 'https://btnqcjrwcdirjhggyhne.supabase.co',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0bnFjanJ3Y2RpcmpoZ2d5aG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxODc3MzYsImV4cCI6MjA3OTc2MzczNn0.fbKa_hmN3ffS1GjreoTExtpfcT9vITZciakRgwbqYtE',
  // Supabase (Backend) - Service Role Key (bypasses RLS). Keep secret; set in Render env vars.
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  
  // Supabase Storage (S3-compatible)
  supabaseS3AccessKey: process.env.SUPABASE_S3_ACCESS_KEY || 'd8f8841daf6c976a42f6d69f59b25dfd',
  supabaseS3SecretKey: process.env.SUPABASE_S3_SECRET_KEY || 'd888b8e7fb74310ab98ed6fff83808c143401eb9cb25739e71ac4efcf6232ea8',
  supabaseS3Endpoint: process.env.SUPABASE_S3_ENDPOINT || 'https://btnqcjrwcdirjhggyhne.storage.supabase.co/storage/v1/s3',
  supabaseS3Bucket: process.env.SUPABASE_S3_BUCKET || 'screenshots',
  
  // Server
  port: process.env.PORT || '3000',
  
  // Netlify
  netlifyUrl: process.env.URL || process.env.DEPLOY_PRIME_URL || '',
};

// Validate required config
if (!config.telegramBotToken) {
  console.warn('Warning: TELEGRAM_BOT_TOKEN is not set');
}

if (!config.supabaseUrl || !config.supabaseAnonKey) {
  console.warn('Warning: Supabase configuration is missing');
}
