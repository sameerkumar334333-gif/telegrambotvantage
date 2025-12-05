-- Supabase Row Level Security (RLS) Policies
-- For Standalone Client-Side Admin Panel
-- Run these SQL queries in Supabase SQL Editor

-- Step 1: Enable Row Level Security (if not already enabled)
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies if they exist (optional, for clean setup)
DROP POLICY IF EXISTS "Allow public read access" ON submissions;
DROP POLICY IF EXISTS "Allow public update access" ON submissions;

-- Step 3: Create Policy for SELECT (Read) - Allow anyone to read submissions
CREATE POLICY "Allow public read access" ON submissions
FOR SELECT
TO anon, authenticated
USING (true);

-- Step 4: Create Policy for UPDATE - Allow updates to status and notes
CREATE POLICY "Allow public update access" ON submissions
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Step 5: Create Policy for INSERT (if needed for direct inserts)
-- Note: Usually only backend should insert, but uncomment if needed
-- CREATE POLICY "Allow public insert access" ON submissions
-- FOR INSERT
-- TO anon, authenticated
-- WITH CHECK (true);

-- IMPORTANT SECURITY NOTES:
-- 1. These policies allow public (anon) access. This is because the admin panel
--    uses the anon key from the browser.
-- 2. For better security, consider:
--    - Using Supabase Auth with proper user authentication
--    - Creating a separate admin table with password hash
--    - Using a custom admin token system
-- 3. The anon key will be visible in browser, so make sure your RLS policies
--    are properly configured to limit access.
-- 4. Consider adding additional policies to restrict based on admin status

-- Optional: More Secure Approach - Check Admin Password
-- Create an admin_users table:
-- CREATE TABLE IF NOT EXISTS admin_users (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   username TEXT UNIQUE NOT NULL,
--   password_hash TEXT NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Then create a function to verify admin:
-- CREATE OR REPLACE FUNCTION is_admin()
-- RETURNS BOOLEAN AS $$
-- BEGIN
--   -- Check if current user is admin (you'll need to implement this logic)
--   RETURN true; -- Replace with actual admin check
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- And update policies:
-- CREATE POLICY "Allow admin read access" ON submissions
-- FOR SELECT TO anon
-- USING (is_admin());

