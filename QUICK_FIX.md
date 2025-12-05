# Quick Fix for Bot Error

## Problem
Bot is showing: "Sorry there was an error processing your submission"

## Solution

### Step 1: Add user_uid column to database

Run this SQL in your Supabase SQL Editor:

```sql
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS user_uid TEXT;
```

### Step 2: Restart the bot

```bash
# Stop current bot (Ctrl+C)
# Then restart:
npm run dev
```

## Alternative: If you can't update database right now

The bot code has been updated to handle missing column gracefully, but it's better to add the column for full functionality.

## Verify

After adding the column:
1. Restart bot
2. Test with /start
3. Enter 7-digit UID
4. Send screenshot
5. Should work without errors

