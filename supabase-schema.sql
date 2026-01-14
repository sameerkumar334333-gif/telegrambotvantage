-- Create submissions table in Supabase
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_user_id BIGINT NOT NULL,
  telegram_username TEXT,
  telegram_first_name TEXT NOT NULL,
  telegram_last_name TEXT,
  user_uid TEXT,
  image_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_telegram_user_id ON submissions(telegram_user_id);

-- Enable Row Level Security (optional, for additional security)
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Policy to allow service role to do everything (for backend access)
-- Note: You'll need to use the service_role key in your backend, not anon key
-- Or create a policy that allows all operations for authenticated service role
CREATE POLICY "Allow all operations for service role" ON submissions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create messages table for tracking all bot messages
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
CREATE POLICY "Allow all operations for service role" ON messages
  FOR ALL
  USING (true)
  WITH CHECK (true);

