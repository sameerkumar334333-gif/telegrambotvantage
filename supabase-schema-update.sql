-- Add user_uid column to submissions table
-- Run this SQL in your Supabase SQL Editor

ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS user_uid TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_submissions_user_uid ON submissions(user_uid);

