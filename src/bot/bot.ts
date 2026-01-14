import TelegramBot from 'node-telegram-bot-api';
import path from 'path';
import fs from 'fs';
import { config } from '../config';
import { supabase } from '../services/supabase';
import { getUserState, setUserState, clearUserState } from '../services/user-state';

const token = config.telegramBotToken;
// Video path - works in both local, Render, and Netlify environments
// Try dist folder first (production build), then root (development)
const distVideoPath = path.join(process.cwd(), 'dist', 'tgbot.mp4');
const rootVideoPath = path.join(process.cwd(), 'tgbot.mp4');
const WELCOME_VIDEO_PATH = fs.existsSync(distVideoPath) ? distVideoPath : rootVideoPath;
const VANTAGE_LINK = 'https://vigco.co/la-com/m8fVIcJJ';

if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is not set in environment variables');
}

// Use webhook mode for Netlify, polling for local development
const useWebhook = process.env.NETLIFY === 'true' || process.env.USE_WEBHOOK === 'true';
export const bot = new TelegramBot(token, { 
  polling: !useWebhook 
});

// Helper function to validate UID (exactly 7 digits)
function isValidUID(uid: string): boolean {
  return /^\d{7}$/.test(uid);
}

// Handle /start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const user = msg.from;

  if (!user) {
    await bot.sendMessage(chatId, 'Unable to retrieve user information.');
    return;
  }

  // Reset user state
  clearUserState(user.id);

  const welcomeMessage = `👋 Hello Trader!

Just Register and Send UID here and You'll be added in VIP channel!

📋 Instructions:
1. Register on the Vantage platform: ${VANTAGE_LINK}
2. Drop your UID (7 digits) below 👇`;

  try {
    // Try dist folder first (production), then root (development)
    const videoPath = WELCOME_VIDEO_PATH;
    await bot.sendVideo(chatId, videoPath, {
      caption: welcomeMessage,
    });

    // Set user state to waiting for UID
    setUserState(user.id, { step: 'waiting_for_uid' });
  } catch (error) {
    console.error('Error sending welcome video:', error);
    // Fallback to text only
    await bot.sendMessage(chatId, welcomeMessage);
    setUserState(user.id, { step: 'waiting_for_uid' });
  }
});

// Handle text messages (UID input)
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const user = msg.from;

  if (!user) {
    return;
  }

  // Skip if it's a command, photo, or document (handled separately)
  if (msg.text?.startsWith('/') || msg.photo || msg.document || msg.video) {
    return;
  }

  const userState = getUserState(user.id);
  const messageText = msg.text?.trim() || '';

  // If user is waiting for UID
  if (userState?.step === 'waiting_for_uid') {
    // Validate UID (must be exactly 7 digits)
    if (!isValidUID(messageText)) {
      await bot.sendMessage(
        chatId,
        '❌ Invalid UID format!\n\nPlease enter a valid 7-digit UID.'
      );
      return;
    }

    // UID is valid, save it directly to database
    try {
      // Show processing message
      const processingMsg = await bot.sendMessage(chatId, '⏳ Processing your UID...');

      // Create submission in database (without image)
      const submissionData: any = {
        telegram_user_id: user.id,
        telegram_username: user.username || null,
        telegram_first_name: user.first_name || '',
        telegram_last_name: user.last_name || null,
        image_url: '', // Empty string as placeholder (no screenshot required)
        status: 'Pending',
        notes: '',
        user_uid: messageText,
      };

      const { data, error } = await supabase
        .from('submissions')
        .insert(submissionData)
        .select()
        .single();

      if (error) {
        console.error('Error saving submission:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        await bot.deleteMessage(chatId, processingMsg.message_id);
        
        // Check if it's a database column error
        if (error.message?.includes('user_uid') || error.code === '42703') {
          await bot.sendMessage(
            chatId,
            '❌ Database configuration error. Please contact admin.\n\nError: Missing user_uid column in database.'
          );
        } else {
          await bot.sendMessage(
            chatId,
            '❌ Sorry, there was an error processing your UID. Please try again later.\n\nIf the problem persists, please contact support.'
          );
        }
        return;
      }

      // Delete processing message and send confirmation
      await bot.deleteMessage(chatId, processingMsg.message_id);
      await bot.sendMessage(
        chatId,
        '✅ Thank you! Your UID has been submitted successfully.\n\n⏳ We\'ll review and You will receive the VIP Channel Join Link.\n\nPlease wait for our response. 🙏'
      );

      // Clear user state (flow completed)
      clearUserState(user.id);
    } catch (error) {
      console.error('Error handling UID submission:', error);
      await bot.sendMessage(
        chatId,
        '❌ Sorry, there was an error processing your UID. Please try again later.'
      );
    }
    return;
  }

  // Default message for users not in flow
  await bot.sendMessage(
    chatId,
    '👋 Hello! Please use /start to begin the verification process.'
  );
});

// Handle photo messages (optional - screenshot not required anymore)
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const user = msg.from;

  if (!user) {
    await bot.sendMessage(chatId, 'Unable to retrieve user information.');
    return;
  }

  // Screenshot is no longer required, just inform user
  await bot.sendMessage(
    chatId,
    '📸 Screenshot is not required. Just send your UID (7 digits) using /start command.'
  );

});

// Handle document messages (optional - screenshot not required anymore)
bot.on('document', async (msg) => {
  const chatId = msg.chat.id;
  const user = msg.from;

  if (!user) {
    await bot.sendMessage(chatId, 'Unable to retrieve user information.');
    return;
  }

  // Screenshot is no longer required, just inform user
  await bot.sendMessage(
    chatId,
    '📸 Screenshot is not required. Just send your UID (7 digits) using /start command.'
  );
});

// Only log when using polling mode
if (!useWebhook) {
  console.log('Telegram bot is running in polling mode...');
}
