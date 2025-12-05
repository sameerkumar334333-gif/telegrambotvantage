import dotenv from 'dotenv';

dotenv.config();

// Configuration helper that works with both .env and Netlify environment variables
export const config = {
  // Telegram Bot
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  
  // Admin Panel
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  sessionSecret: process.env.SESSION_SECRET || 'change-this-secret-in-production',
  
  // Supabase Database
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  
  // Supabase Storage (S3-compatible)
  supabaseS3AccessKey: process.env.SUPABASE_S3_ACCESS_KEY || '',
  supabaseS3SecretKey: process.env.SUPABASE_S3_SECRET_KEY || '',
  supabaseS3Endpoint: process.env.SUPABASE_S3_ENDPOINT || '',
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
