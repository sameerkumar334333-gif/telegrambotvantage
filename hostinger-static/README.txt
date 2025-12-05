HOSTINGER STATIC HOSTING - STANDALONE ADMIN PANEL
==================================================

🎉 NEW: Pure Client-Side Version (No Backend Needed!)
------------------------------------------------------

This folder now contains TWO versions:

1. OLD VERSION (needs backend server):
   - admin.html
   - admin.js
   - admin.css
   
2. NEW STANDALONE VERSION (works on static hosting):
   - admin-standalone.html  ⭐ USE THIS ONE!
   - admin-standalone.js
   - admin.css (same styles)
   - config.js (configuration file)

QUICK START:
------------

1. Edit config.js and add your Supabase credentials:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - ADMIN_PASSWORD

2. Setup Supabase RLS policies (see supabase-rls-policies.sql)

3. Upload all files to Hostinger public_html folder

4. Access at: https://yourdomain.com/admin-standalone.html

FILES INCLUDED:
---------------
✅ admin-standalone.html - Main admin panel (NEW!)
✅ admin-standalone.js - Client-side JavaScript with Supabase
✅ admin.css - Admin panel styles
✅ config.js - Configuration file (EDIT THIS!)
✅ supabase-rls-policies.sql - Database security policies
✅ SETUP_GUIDE.md - Detailed setup instructions

VIDEO FILE NOTE:
----------------
📹 tgbot.mp4 - Welcome video for Telegram bot
   - Location: Root directory (../tgbot.mp4)
   - Size: ~4.4MB
   - Used by: Backend bot server (sends with /start command)
   - NOT needed for: Static hosting admin panel
   - If deploying bot backend separately, keep this file with backend code

FEATURES:
---------
✅ View all submissions
✅ Filter by status
✅ Search by UID/Username
✅ Update status
✅ Add/edit notes
✅ Works completely static (no backend!)

IMPORTANT:
----------
⚠️  The standalone version CANNOT send Telegram messages
⚠️  You still need a backend server for the Telegram bot
⚠️  Make sure to setup Supabase RLS policies for security
⚠️  Video file (tgbot.mp4) is needed for bot backend, not for static hosting

See SETUP_GUIDE.md for complete instructions!
