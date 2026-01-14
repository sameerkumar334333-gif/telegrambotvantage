# 🔧 Fix: Permission Denied for Table Submissions

## Problem
Bot is getting this error:
```
❌ permission denied for table submissions
```

## Root Cause
- Bot is using **anon key** (public key)
- RLS (Row Level Security) is enabled on `submissions` table
- Current policy only allows **service_role** key, not anon key

## Solution (Choose One)

### Option 1: Allow Anon Key (Quick Fix) ⚡

**Run this SQL in Supabase SQL Editor:**

```sql
-- Allow anon key to insert and select submissions
DROP POLICY IF EXISTS "Allow anon insert and select" ON submissions;
CREATE POLICY "Allow anon insert and select" ON submissions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Also for messages table
DROP POLICY IF EXISTS "Allow anon insert and select" ON messages;
CREATE POLICY "Allow anon insert and select" ON messages
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

**Pros:**
- ✅ Quick fix
- ✅ No code changes needed
- ✅ Works immediately

**Cons:**
- ⚠️ Less secure (anon key can access data)
- ⚠️ Anyone with anon key can insert

---

### Option 2: Use Service Role Key (More Secure) 🔒

**Step 1: Get Service Role Key**
1. Go to Supabase Dashboard
2. Settings → API
3. Copy **service_role** key (secret key, not anon key!)

**Step 2: Update Environment Variables**

Add to your `.env` file:
```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Step 3: Update Code**

Update `src/services/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

// Use service_role key for backend operations (more secure)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || config.supabaseAnonKey;

export const supabase = createClient(config.supabaseUrl, supabaseKey);
```

**Pros:**
- ✅ More secure
- ✅ Bypasses RLS (as intended for backend)
- ✅ Better for production

**Cons:**
- ⚠️ Requires code change
- ⚠️ Need to keep service_role key secret

---

## Recommended: Option 1 (Quick Fix)

For now, use **Option 1** to get it working quickly. You can switch to Option 2 later for better security.

## After Fix

1. Run the SQL from `fix-rls-permissions.sql`
2. Test the bot:
   - Send `/start`
   - Send UID (e.g., `1234567`)
   - Should work now! ✅

## Files Created

- ✅ `fix-rls-permissions.sql` - SQL to fix permissions
- ✅ `FIX_RLS_PERMISSIONS.md` - This guide
