# Hostinger Static Hosting - Standalone Admin Panel Setup Guide

## 🎯 What is This?

This is a **pure client-side admin panel** that works completely on Hostinger static hosting. No backend server needed!

- ✅ Works on any static hosting (Hostinger, GitHub Pages, Netlify Static, etc.)
- ✅ Uses Supabase JavaScript SDK (loaded from CDN)
- ✅ Direct database connection from browser
- ✅ Simple password authentication
- ✅ View, filter, search, and update submissions

## ⚠️ Important Notes

1. **Telegram Message Sending**: This standalone version CANNOT send messages to Telegram users. Only the backend server can do that. So the "Send Message" feature is removed.

2. **Database Security**: Make sure your Supabase table has proper Row Level Security (RLS) policies. The anon key will be visible in the browser, so use RLS to protect your data.

3. **Password Security**: The admin password is stored in `config.js`. For better security, consider using Supabase Auth instead of simple password check.

## 🚀 Setup Instructions

### Step 1: Get Supabase Credentials

1. Go to your Supabase Dashboard
2. Navigate to **Settings → API**
3. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (the public key, not service_role)

### Step 2: Configure Admin Panel

1. Open `config.js` file
2. Update these values:

```javascript
const SUPABASE_CONFIG = {
    SUPABASE_URL: 'https://your-project.supabase.co',  // Your Supabase URL
    SUPABASE_ANON_KEY: 'your-anon-key-here',          // Your anon key
    ADMIN_PASSWORD: 'your-secure-password',            // Change this!
    ADMIN_USERNAME: 'admin'                            // Optional
};
```

### Step 3: Setup Supabase Database Security

Since this connects directly from browser, you need to enable RLS policies:

1. Go to Supabase Dashboard → **Authentication → Policies**
2. Create policies for `submissions` table:

**Policy 1: Allow SELECT (Read)**
```sql
CREATE POLICY "Allow public read access" ON submissions
FOR SELECT
TO anon
USING (true);
```

**Policy 2: Allow UPDATE**
```sql
CREATE POLICY "Allow public update access" ON submissions
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);
```

**OR** if you want more security, create a custom policy that checks admin password (stored in a separate table).

### Step 4: Upload Files to Hostinger

1. Login to Hostinger hPanel
2. Go to **File Manager**
3. Navigate to `public_html` (or your domain folder)
4. Upload all files from `hostinger-static/` folder:
   - `admin-standalone.html`
   - `admin-standalone.js`
   - `admin.css`
   - `config.js`

### Step 5: Access Admin Panel

1. Visit: `https://yourdomain.com/admin-standalone.html`
2. Login with:
   - Username: `admin` (or what you set in config.js)
   - Password: The password you set in config.js

## 📁 File Structure

```
hostinger-static/
├── admin-standalone.html    # Main admin panel page
├── admin-standalone.js      # Client-side JavaScript (Supabase)
├── admin.css                # Styles (same as before)
├── config.js                # Configuration (Supabase URL, keys, password)
└── SETUP_GUIDE.md          # This file
```

## 🔧 Features

### ✅ What Works:
- View all submissions
- Filter by status (Pending/Approved/Rejected)
- Search by Telegram UID or username
- Update submission status
- Add/edit notes
- View screenshots (opens in new tab)

### ❌ What Doesn't Work:
- Sending messages to Telegram users (needs backend)
- Server-side authentication (uses simple password check)
- Session management (uses localStorage)

## 🔒 Security Recommendations

1. **Use Supabase RLS**: Enable Row Level Security in Supabase
2. **Change Default Password**: Always change the default password in config.js
3. **Use HTTPS**: Make sure your domain uses SSL/HTTPS
4. **Consider Supabase Auth**: For better security, implement Supabase Authentication instead of simple password

## 🐛 Troubleshooting

### "Supabase client not initialized"
- Check that `config.js` has correct SUPABASE_URL and SUPABASE_ANON_KEY
- Make sure the Supabase CDN script is loaded (check browser console)

### "Failed to load submissions"
- Check Supabase RLS policies are set correctly
- Verify your anon key has read permissions
- Check browser console for detailed error messages

### "Failed to update status"
- Check Supabase RLS policies allow UPDATE operations
- Verify your anon key has write permissions

### Login not working
- Check `config.js` has correct ADMIN_PASSWORD
- Clear browser localStorage and try again
- Check browser console for errors

## 📝 Example config.js

```javascript
const SUPABASE_CONFIG = {
    SUPABASE_URL: 'https://btnqcjrwcdirjhggyhne.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    ADMIN_PASSWORD: 'MySecurePassword123!',
    ADMIN_USERNAME: 'admin'
};
```

## 🎉 That's It!

Your admin panel is now ready to use on Hostinger static hosting. No backend server needed!

For the Telegram bot itself, you still need to host the backend server separately (Render, Railway, etc.).

