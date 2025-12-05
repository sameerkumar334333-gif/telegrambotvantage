import TelegramBot from 'node-telegram-bot-api';
import path from 'path';
import { config } from '../config';
import { supabase } from '../services/supabase';
import { uploadImageToSupabase } from '../services/storage';
import { getUserState, setUserState, clearUserState } from '../services/user-state';

const token = config.telegramBotToken;
// Video path - works in both local and Netlify environments
const WELCOME_VIDEO_PATH = path.join(process.cwd(), 'tgbot.mp4');
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

To get VIP access to the Wolf of Forex VIP Community, please follow these instructions:

📋 Instructions:
1. Register on the Vantage platform: ${VANTAGE_LINK}
2. Drop your UID (7 digits)
3. Deposit $50
4. Send screenshot of your deposit.



Let's get started! Drop your UID below 👇`;

  try {
    // Send video file with welcome message
    await bot.sendVideo(chatId, WELCOME_VIDEO_PATH, {
      caption: welcomeMessage,
    });

    // Set user state to waiting for UID
    setUserState(user.id, { step: 'waiting_for_uid' });
  } catch (error) {
    console.error('Error sending welcome message:', error);
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

    // UID is valid, save it and ask for screenshot
    setUserState(user.id, {
      step: 'waiting_for_screenshot',
      uid: messageText,
    });

    await bot.sendMessage(
      chatId,
      '✅ UID received successfully!\n\n💰 Please deposit $50 and send the screenshot of your deposit.'
    );
    return;
  }

  // If user is waiting for screenshot but sends text
  if (userState?.step === 'waiting_for_screenshot') {
    await bot.sendMessage(chatId, '📸 Please send your screenshot to continue.');
    return;
  }

  // Default message for users not in flow
  await bot.sendMessage(
    chatId,
    '👋 Hello! Please use /start to begin the verification process.'
  );
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

  // If user hasn't provided UID yet
  if (!userState || userState.step !== 'waiting_for_screenshot' || !userState.uid) {
    await bot.sendMessage(
      chatId,
      '⚠️ Please provide your UID first using /start command.'
    );
    return;
  }

  try {
    // Get the largest photo
    const photos = msg.photo;
    if (!photos || photos.length === 0) {
      await bot.sendMessage(chatId, 'Please send a valid image (screenshot) to continue.');
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
    await bot.sendMessage(
      chatId,
      '✅ Thank you! Your screenshot has been submitted successfully.\n\n⏳ We will review your submission and get back to you within 30-45 minutes.\n\nPlease wait for our response. 🙏'
    );

    // Clear user state (flow completed)
    clearUserState(user.id);
  } catch (error) {
    console.error('Error handling photo:', error);
    await bot.sendMessage(
      chatId,
      '❌ Sorry, there was an error processing your screenshot. Please try again later.'
    );
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

  // If user hasn't provided UID yet
  if (!userState || userState.step !== 'waiting_for_screenshot' || !userState.uid) {
    await bot.sendMessage(
      chatId,
      '⚠️ Please provide your UID first using /start command.'
    );
    return;
  }

  // Check if it's an image file
  const mimeType = document.mime_type || '';
  if (!mimeType.startsWith('image/')) {
    await bot.sendMessage(chatId, '📸 Please send an image (screenshot) to continue.');
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
    await bot.sendMessage(
      chatId,
      '✅ Thank you! Your screenshot has been submitted successfully.\n\n⏳ We will review your submission and get back to you within 30-45 minutes.\n\nPlease wait for our response. 🙏'
    );

    // Clear user state (flow completed)
    clearUserState(user.id);
  } catch (error) {
    console.error('Error handling document:', error);
    await bot.sendMessage(
      chatId,
      '❌ Sorry, there was an error processing your screenshot. Please try again later.'
    );
  }
});

// Only log when using polling mode
if (!useWebhook) {
  console.log('Telegram bot is running in polling mode...');
}
