# Telegram Bot + Admin Panel

A simple Telegram bot that collects user information and screenshots, with a secure web admin panel for reviewing submissions. Built with Node.js, TypeScript, Express, and Supabase.

## Features

- **Telegram Bot**: Collects user Telegram UID, username, name, and screenshots
- **Admin Panel**: Password-protected web dashboard to review and manage submissions
- **Supabase Integration**: Uses Supabase for database and storage
- **Status Management**: Track submissions as Pending, Approved, or Rejected
- **Notes**: Add notes to each submission
- **Search & Filter**: Filter by status and search by UID or username

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Supabase Setup

#### Database Table

Run the SQL script in your Supabase SQL Editor:

```sql
-- See supabase-schema.sql file for the complete schema
```

Or manually create the `submissions` table with the following columns:
- `id` (uuid, primary key)
- `telegram_user_id` (bigint, not null)
- `telegram_username` (text, nullable)
- `telegram_first_name` (text, not null)
- `telegram_last_name` (text, nullable)
- `image_url` (text, not null)
- `status` (text, default 'Pending')
- `notes` (text, default '')
- `created_at` (timestamp, default now())

#### Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `screenshots`
3. Make it **public** (enable public access)
4. Get your S3-compatible credentials from Supabase Storage settings

### 3. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Admin Panel
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here
SESSION_SECRET=your_random_session_secret_here

# Supabase Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key

# Supabase Storage (S3-compatible)
SUPABASE_S3_ACCESS_KEY=your_s3_access_key
SUPABASE_S3_SECRET_KEY=your_s3_secret_key
SUPABASE_S3_ENDPOINT=https://your-project.supabase.co/storage/v1/s3
SUPABASE_S3_BUCKET=screenshots

# Server
PORT=3000
```

**Important**: 
- Replace all placeholder values with your actual credentials
- Generate a random `SESSION_SECRET` (e.g., use `openssl rand -hex 32`)
- Get Supabase credentials from your Supabase project settings

### 4. Build and Run

#### Development Mode

```bash
npm run dev
```

#### Production Mode

```bash
npm run build
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## Usage

### Telegram Bot

1. Find your bot on Telegram (using the username you set with BotFather)
2. Send `/start` to begin
3. Send a screenshot/image when prompted
4. You'll receive a confirmation message when the submission is saved

### Admin Panel

1. Navigate to `http://localhost:3000/admin`
2. Login with your `ADMIN_USERNAME` and `ADMIN_PASSWORD`
3. View all submissions in the table
4. Use the status filter to filter by Pending/Approved/Rejected
5. Use the search box to search by Telegram UID or username
6. Click on screenshot thumbnails to view full-size images
7. Change submission status using the dropdown
8. Add/edit notes in the notes field (saves automatically on blur)

## Project Structure

```
telegram-bot-vantage/
├── src/
│   ├── bot/
│   │   └── bot.ts              # Telegram bot logic
│   ├── routes/
│   │   ├── admin.ts            # Admin panel routes
│   │   └── api.ts              # API endpoints
│   ├── services/
│   │   ├── supabase.ts         # Supabase client
│   │   └── storage.ts          # Image upload service
│   ├── middleware/
│   │   └── auth.ts             # Authentication middleware
│   ├── types/
│   │   └── index.ts            # TypeScript types
│   └── server.ts               # Express server
├── public/
│   ├── admin.html              # Admin panel HTML
│   ├── admin.css               # Admin panel styles
│   └── admin.js                # Admin panel JavaScript
├── supabase-schema.sql         # Database schema
├── package.json
├── tsconfig.json
└── README.md
```

## API Endpoints

### Admin Routes
- `GET /admin` - Admin panel (requires authentication)
- `POST /admin/login` - Login
- `POST /admin/logout` - Logout
- `GET /admin/check` - Check authentication status

### API Routes (all require authentication)
- `GET /api/submissions?status=All&search=term` - Get all submissions
- `PATCH /api/submissions/:id` - Update submission status/notes

## Security Notes

- Admin credentials are stored in environment variables
- Passwords are hashed using bcrypt
- Session-based authentication for admin panel
- All API routes require authentication
- Consider enabling Supabase Row Level Security (RLS) for additional security

## Troubleshooting

### Bot not responding
- Check that `TELEGRAM_BOT_TOKEN` is correct
- Verify the bot is running (check console logs)
- Make sure the bot is not blocked

### Images not uploading
- Verify Supabase Storage bucket exists and is public
- Check S3 credentials are correct
- Ensure bucket name matches `SUPABASE_S3_BUCKET` in `.env`

### Database errors
- Verify Supabase URL and anon key are correct
- Check that the `submissions` table exists
- Ensure table schema matches the expected structure

### Admin panel login fails
- Verify `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env`
- Check that `SESSION_SECRET` is set
- Clear browser cookies and try again

## License

ISC

