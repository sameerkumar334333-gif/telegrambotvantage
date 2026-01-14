-- Fix RLS Permissions for Bot to Insert Submissions
-- Run this SQL in your Supabase SQL Editor

-- Option 1: Allow anon key to insert and select (for bot operations)
-- This allows the bot using anon key to insert submissions

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow anon insert and select" ON submissions;

-- Create new policy for anon key
CREATE POLICY "Allow anon insert and select" ON submissions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Also fix for messages table
DROP POLICY IF EXISTS "Allow anon insert and select" ON messages;

CREATE POLICY "Allow anon insert and select" ON messages
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('submissions', 'messages')
ORDER BY tablename, policyname;
