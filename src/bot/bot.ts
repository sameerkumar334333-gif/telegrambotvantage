import TelegramBot from 'node-telegram-bot-api';
import path from 'path';
import fs from 'fs';
import { config } from '../config';
import { supabase } from '../services/supabase';
import { uploadImageToSupabase } from '../services/storage';
import { getUserState, setUserState, clearUserState } from '../services/user-state';
import { logMessage } from '../services/message-logger';

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

// Use webhook mode for Netlify/Render, polling for local development
const useWebhook = process.env.NETLIFY === 'true' || process.env.USE_WEBHOOK === 'true' || process.env.RENDER === 'true';
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

  // Log incoming command
  await logMessage({
    telegram_user_id: user.id,
    telegram_username: user.username || null,
    telegram_first_name: user.first_name || null,
    telegram_last_name: user.last_name || null,
    message_text: '/start',
    direction: 'incoming',
    message_type: 'command',
  });

  // Reset user state
  clearUserState(user.id);

  const welcomeMessage = `👋 Hello Trader!

To get VIP access to the Wolf of Forex VIP Community, please follow these instructions:

📋 Instructions:
1. Register on the Vantage platform: ${VANTAGE_LINK}
2. Drop your UID (7 digits)
3. Deposit $50
4. Send screenshot of your deposit.



Let's get started! Drop your UID below 👇`;

  try {
    // Try dist folder first (production), then root (development)
    const videoPath = WELCOME_VIDEO_PATH;
    await bot.sendVideo(chatId, videoPath, {
      caption: welcomeMessage,
    });

    // Log outgoing message
    await logMessage({
      telegram_user_id: user.id,
      telegram_username: user.username || null,
      telegram_first_name: user.first_name || null,
      telegram_last_name: user.last_name || null,
      message_text: welcomeMessage,
      direction: 'outgoing',
      message_type: 'video',
    });

    // Set user state to waiting for UID
    setUserState(user.id, { step: 'waiting_for_uid' });
  } catch (error) {
    console.error('Error sending welcome video:', error);
    // Fallback to text only
    await bot.sendMessage(chatId, welcomeMessage);
    
    // Log outgoing message
    await logMessage({
      telegram_user_id: user.id,
      telegram_username: user.username || null,
      telegram_first_name: user.first_name || null,
      telegram_last_name: user.last_name || null,
      message_text: welcomeMessage,
      direction: 'outgoing',
      message_type: 'text',
    });
    
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

  // Log incoming message
  await logMessage({
    telegram_user_id: user.id,
    telegram_username: user.username || null,
    telegram_first_name: user.first_name || null,
    telegram_last_name: user.last_name || null,
    message_text: messageText,
    direction: 'incoming',
    message_type: 'text',
  });

  // If user is waiting for UID
  if (userState?.step === 'waiting_for_uid') {
    // Validate UID (must be exactly 7 digits)
    if (!isValidUID(messageText)) {
      const errorMsg = '❌ Invalid UID format!\n\nPlease enter a valid 7-digit UID.';
      await bot.sendMessage(chatId, errorMsg);
      
      // Log outgoing message
      await logMessage({
        telegram_user_id: user.id,
        telegram_username: user.username || null,
        telegram_first_name: user.first_name || null,
        telegram_last_name: user.last_name || null,
        message_text: errorMsg,
        direction: 'outgoing',
        message_type: 'text',
      });
      return;
    }

    // UID is valid, save it and ask for screenshot
    setUserState(user.id, {
      step: 'waiting_for_screenshot',
      uid: messageText,
    });

    const successMsg = '✅ UID received successfully!\n\n💰 Please deposit $50 and send the screenshot of your deposit.';
    await bot.sendMessage(chatId, successMsg);
    
    // Log outgoing message
    await logMessage({
      telegram_user_id: user.id,
      telegram_username: user.username || null,
      telegram_first_name: user.first_name || null,
      telegram_last_name: user.last_name || null,
      message_text: successMsg,
      direction: 'outgoing',
      message_type: 'text',
    });
    return;
  }

  // If user is waiting for screenshot but sends text
  if (userState?.step === 'waiting_for_screenshot') {
    const screenshotMsg = '📸 Please send your screenshot to continue.';
    await bot.sendMessage(chatId, screenshotMsg);
    
    // Log outgoing message
    await logMessage({
      telegram_user_id: user.id,
      telegram_username: user.username || null,
      telegram_first_name: user.first_name || null,
      telegram_last_name: user.last_name || null,
      message_text: screenshotMsg,
      direction: 'outgoing',
      message_type: 'text',
    });
    return;
  }

  // Default message for users not in flow
  const defaultMsg = '👋 Hello! Please use /start to begin the verification process.';
  await bot.sendMessage(chatId, defaultMsg);
  
  // Log outgoing message
  await logMessage({
    telegram_user_id: user.id,
    telegram_username: user.username || null,
    telegram_first_name: user.first_name || null,
    telegram_last_name: user.last_name || null,
    message_text: defaultMsg,
    direction: 'outgoing',
    message_type: 'text',
  });
});

// Handle photo messages (screenshot submission)
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const user = msg.from;

  if (!user) {
    await bot.sendMessage(chatId, 'Unable to retrieve user information.');
    return;
  }

  const userState = getUserState(user.id);

  // Log incoming photo
  await logMessage({
    telegram_user_id: user.id,
    telegram_username: user.username || null,
    telegram_first_name: user.first_name || null,
    telegram_last_name: user.last_name || null,
    message_text: '[Photo sent]',
    direction: 'incoming',
    message_type: 'photo',
  });

  // If user hasn't provided UID yet
  if (!userState || userState.step !== 'waiting_for_screenshot' || !userState.uid) {
    const errorMsg = '⚠️ Please provide your UID first using /start command.';
    await bot.sendMessage(chatId, errorMsg);
    
    // Log outgoing message
    await logMessage({
      telegram_user_id: user.id,
      telegram_username: user.username || null,
      telegram_first_name: user.first_name || null,
      telegram_last_name: user.last_name || null,
      message_text: errorMsg,
      direction: 'outgoing',
      message_type: 'text',
    });
    return;
  }

  try {
    // Get the largest photo
    const photos = msg.photo;
    if (!photos || photos.length === 0) {
      const errorMsg = 'Please send a valid image (screenshot) to continue.';
      await bot.sendMessage(chatId, errorMsg);
      
      // Log outgoing message
      await logMessage({
        telegram_user_id: user.id,
        telegram_username: user.username || null,
        telegram_first_name: user.first_name || null,
        telegram_last_name: user.last_name || null,
        message_text: errorMsg,
        direction: 'outgoing',
        message_type: 'text',
      });
      return;
    }

    const largestPhoto = photos[photos.length - 1];
    const fileId = largestPhoto.file_id;

    // Get file info and download URL
    const file = await bot.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;

    // Determine file extension
    const fileExtension = file.file_path?.split('.').pop() || 'jpg';

    // Show processing message
    const processingMsg = await bot.sendMessage(chatId, '⏳ Processing your screenshot...');

    // Upload to Supabase Storage
    const { imageUrl } = await uploadImageToSupabase(fileUrl, fileExtension);

    // Create submission in database
    const submissionData: any = {
      telegram_user_id: user.id,
      telegram_username: user.username || null,
      telegram_first_name: user.first_name || '',
      telegram_last_name: user.last_name || null,
      image_url: imageUrl,
      status: 'Pending',
      notes: '',
    };

    // Only add user_uid if column exists (graceful fallback)
    if (userState.uid) {
      submissionData.user_uid = userState.uid;
    }

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
          '❌ Sorry, there was an error processing your submission. Please try again later.\n\nIf the problem persists, please contact support.'
        );
      }
      return;
    }

    // Delete processing message and send confirmation
    await bot.deleteMessage(chatId, processingMsg.message_id);
    const confirmationMsg = '✅ Thank you! Your screenshot has been submitted successfully.\n\n⏳ We will review your submission and get back to you within 30-45 minutes.\n\nPlease wait for our response. 🙏';
    await bot.sendMessage(chatId, confirmationMsg);
    
    // Log outgoing message
    await logMessage({
      telegram_user_id: user.id,
      telegram_username: user.username || null,
      telegram_first_name: user.first_name || null,
      telegram_last_name: user.last_name || null,
      message_text: confirmationMsg,
      direction: 'outgoing',
      message_type: 'text',
    });

    // Clear user state (flow completed)
    clearUserState(user.id);
  } catch (error) {
    console.error('Error handling photo:', error);
    const errorMsg = '❌ Sorry, there was an error processing your screenshot. Please try again later.';
    await bot.sendMessage(chatId, errorMsg);
    
    // Log outgoing message
    await logMessage({
      telegram_user_id: user.id,
      telegram_username: user.username || null,
      telegram_first_name: user.first_name || null,
      telegram_last_name: user.last_name || null,
      message_text: errorMsg,
      direction: 'outgoing',
      message_type: 'text',
    });
  }
});

// Handle document messages (in case user sends image as file)
bot.on('document', async (msg) => {
  const chatId = msg.chat.id;
  const user = msg.from;
  const document = msg.document;

  if (!user || !document) {
    await bot.sendMessage(chatId, 'Please send a valid image (screenshot) to continue.');
    return;
  }

  const userState = getUserState(user.id);

  // Log incoming document
  await logMessage({
    telegram_user_id: user.id,
    telegram_username: user.username || null,
    telegram_first_name: user.first_name || null,
    telegram_last_name: user.last_name || null,
    message_text: `[Document sent: ${document.file_name || 'unknown'}]`,
    direction: 'incoming',
    message_type: 'document',
  });

  // If user hasn't provided UID yet
  if (!userState || userState.step !== 'waiting_for_screenshot' || !userState.uid) {
    const errorMsg = '⚠️ Please provide your UID first using /start command.';
    await bot.sendMessage(chatId, errorMsg);
    
    // Log outgoing message
    await logMessage({
      telegram_user_id: user.id,
      telegram_username: user.username || null,
      telegram_first_name: user.first_name || null,
      telegram_last_name: user.last_name || null,
      message_text: errorMsg,
      direction: 'outgoing',
      message_type: 'text',
    });
    return;
  }

  // Check if it's an image file
  const mimeType = document.mime_type || '';
  if (!mimeType.startsWith('image/')) {
    const errorMsg = '📸 Please send an image (screenshot) to continue.';
    await bot.sendMessage(chatId, errorMsg);
    
    // Log outgoing message
    await logMessage({
      telegram_user_id: user.id,
      telegram_username: user.username || null,
      telegram_first_name: user.first_name || null,
      telegram_last_name: user.last_name || null,
      message_text: errorMsg,
      direction: 'outgoing',
      message_type: 'text',
    });
    return;
  }

  try {
    // Get file info and download URL
    const file = await bot.getFile(document.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;

    // Determine file extension
    const fileExtension = document.file_name?.split('.').pop() || mimeType.split('/')[1] || 'jpg';

    // Show processing message
    const processingMsg = await bot.sendMessage(chatId, '⏳ Processing your screenshot...');

    // Upload to Supabase Storage
    const { imageUrl } = await uploadImageToSupabase(fileUrl, fileExtension);

    // Create submission in database
    const submissionData: any = {
      telegram_user_id: user.id,
      telegram_username: user.username || null,
      telegram_first_name: user.first_name || '',
      telegram_last_name: user.last_name || null,
      image_url: imageUrl,
      status: 'Pending',
      notes: '',
    };

    // Only add user_uid if column exists (graceful fallback)
    if (userState.uid) {
      submissionData.user_uid = userState.uid;
    }

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
          '❌ Sorry, there was an error processing your submission. Please try again later.\n\nIf the problem persists, please contact support.'
        );
      }
      return;
    }

    // Delete processing message and send confirmation
    await bot.deleteMessage(chatId, processingMsg.message_id);
    const confirmationMsg = '✅ Thank you! Your screenshot has been submitted successfully.\n\n⏳ We will review your submission and get back to you within 30-45 minutes.\n\nPlease wait for our response. 🙏';
    await bot.sendMessage(chatId, confirmationMsg);
    
    // Log outgoing message
    await logMessage({
      telegram_user_id: user.id,
      telegram_username: user.username || null,
      telegram_first_name: user.first_name || null,
      telegram_last_name: user.last_name || null,
      message_text: confirmationMsg,
      direction: 'outgoing',
      message_type: 'text',
    });

    // Clear user state (flow completed)
    clearUserState(user.id);
  } catch (error) {
    console.error('Error handling document:', error);
    const errorMsg = '❌ Sorry, there was an error processing your screenshot. Please try again later.';
    await bot.sendMessage(chatId, errorMsg);
    
    // Log outgoing message
    await logMessage({
      telegram_user_id: user.id,
      telegram_username: user.username || null,
      telegram_first_name: user.first_name || null,
      telegram_last_name: user.last_name || null,
      message_text: errorMsg,
      direction: 'outgoing',
      message_type: 'text',
    });
  }
});

// Only log when using polling mode
if (!useWebhook) {
  console.log('✅ Telegram bot is running in polling mode...');
  console.log(`✅ Bot token: ${token.substring(0, 10)}...${token.substring(token.length - 5)}`);
}

// Error handler for bot
bot.on('error', (error) => {
  console.error('❌ Telegram Bot Error:', error.message || error);
});

bot.on('polling_error', (error) => {
  console.error('❌ Telegram Bot Polling Error:', error.message || error);
  // Don't crash - bot will retry automatically
});
