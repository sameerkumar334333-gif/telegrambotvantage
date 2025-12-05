# Video Setup Instructions

## How to Add Welcome Video to Bot

The bot is configured to send a welcome video with the /start command. Here's how to set it up:

### Option 1: Upload Video to Bot (Recommended)

1. **Upload video to your bot:**
   - Open Telegram and find your bot
   - Send the video file to your bot
   - The bot will receive it (you can ignore any response)

2. **Get the video file_id:**
   - You need to access the Telegram Bot API to get the file_id
   - Or use a tool like @userinfobot or check bot logs
   - The file_id will look like: `BAACAgIAAxkBAAIBY2...`

3. **Add to .env file:**
   ```env
   WELCOME_VIDEO_FILE_ID=your_video_file_id_here
   ```

### Option 2: Use Video URL (Alternative)

If you have a video hosted online, you can modify the bot code to use a URL instead of file_id.

### Option 3: Skip Video (Current Default)

If you don't set `WELCOME_VIDEO_FILE_ID`, the bot will send the welcome message as text only (no video).

## Video Requirements

- **Format**: MP4 recommended
- **Size**: Keep under 50MB for Telegram
- **Duration**: 1-2 minutes recommended
- **Content**: Should explain the verification process

## Testing

After adding the video file_id:
1. Restart the bot server
2. Send `/start` to your bot
3. Verify the video is sent with the welcome message

