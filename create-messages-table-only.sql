-- Create messages table ONLY (if submissions table already exists)
-- Run this SQL in your Supabase SQL Editor

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_user_id BIGINT NOT NULL,
  telegram_username TEXT,
  telegram_first_name TEXT,
  telegram_last_name TEXT,
  message_text TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'photo', 'document', 'video', 'command')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for messages table
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_telegram_user_id ON messages(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_direction ON messages(direction);

-- Enable Row Level Security for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy to allow service role to do everything (for backend access)
-- Use a unique name to avoid conflicts
DROP POLICY IF EXISTS "Allow all operations for service role on messages" ON messages;
CREATE POLICY "Allow all operations for service role on messages" ON messages
  FOR ALL
  USING (true)
  WITH CHECK (true);

