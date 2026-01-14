# 🔧 Fix: `permission denied for table submissions`

This error means **Postgres privileges (GRANTs)** are missing for the role your bot uses.

## ✅ Best fix (recommended for Render): use Service Role in backend

1. Supabase Dashboard → **Settings → API**
2. Copy **service_role** key (keep it secret)
3. Render → your service → **Environment**
4. Add:

```bash
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

Now the backend uses `SUPABASE_SERVICE_ROLE_KEY` automatically (and bypasses RLS), so UID insert will work even when RLS is strict.

## Alternative fix (SQL): allow anon/authenticated to insert (less secure)

Run `fix-supabase-permission-denied.sql` in Supabase SQL Editor.  
It does **both**:
- **GRANT** table privileges to `anon` and `authenticated`
- Adds basic **RLS policies** for insert/select

## Why your earlier RLS policy didn’t fix it

- RLS policies control *row-level access*.
- Your error is **table privilege**: `permission denied for table ...`
- So you must add **GRANT** permissions (or use service role key).

