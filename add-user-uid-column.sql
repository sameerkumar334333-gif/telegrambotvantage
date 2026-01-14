-- Add user_uid column to existing submissions table
-- Run this SQL in your Supabase SQL Editor if the column doesn't exist

-- Check if column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'submissions' 
        AND column_name = 'user_uid'
    ) THEN
        ALTER TABLE submissions ADD COLUMN user_uid TEXT;
        CREATE INDEX IF NOT EXISTS idx_submissions_user_uid ON submissions(user_uid);
        RAISE NOTICE 'Column user_uid added successfully';
    ELSE
        RAISE NOTICE 'Column user_uid already exists';
    END IF;
END $$;
