import TelegramBot from 'node-telegram-bot-api';
import { config } from '../config';
import { supabase } from '../services/supabase';
import { getUserState, setUserState, clearUserState } from '../services/user-state';
import { logMessage } from '../services/message-logger';

const token = config.telegramBotToken;
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

Just Register and Send UID here and You'll be added in VIP channel!

📋 Instructions:
1. Register on the Vantage platform: ${VANTAGE_LINK}
2. Drop your UID (7 digits) below 👇`;

  // Send text-only welcome message (video removed)
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

  // Set user state to waiting for UID
  setUserState(user.id, { step: 'waiting_for_uid' });
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
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error hint:', error.hint);
        await bot.deleteMessage(chatId, processingMsg.message_id);
        
        // Check if it's a database column error
        if (error.message?.includes('user_uid') || 
            error.code === '42703' || 
            error.message?.includes('column "user_uid" does not exist') ||
            error.message?.includes('column user_uid does not exist')) {
          const errorMsg = '❌ Database configuration error.\n\nMissing user_uid column in database.\n\nPlease run the SQL from add-user-uid-column.sql in your Supabase SQL Editor.';
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
        } else {
          // Show more detailed error for debugging
          const errorDetails = error.message || error.hint || 'Unknown error';
          console.error('Full error:', errorDetails);
          const errorMsg = `❌ Sorry, there was an error processing your UID.\n\nError: ${errorDetails}\n\nPlease try again later or contact support.`;
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
        return;
      }

      // Delete processing message and send confirmation
      await bot.deleteMessage(chatId, processingMsg.message_id);
      const confirmationMsg = '✅ Thank you! Your UID has been submitted successfully.\n\n⏳ We\'ll review and You will receive the VIP Channel Join Link.\n\nPlease wait for our response. 🙏';
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
      console.error('Error handling UID submission:', error);
      const errorMsg = '❌ Sorry, there was an error processing your UID. Please try again later.';
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

// Handle photo messages (optional - screenshot not required anymore)
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const user = msg.from;

  if (!user) {
    await bot.sendMessage(chatId, 'Unable to retrieve user information.');
    return;
  }

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

  // Screenshot is no longer required, just inform user
  const infoMsg = '📸 Screenshot is not required. Just send your UID (7 digits) using /start command.';
  await bot.sendMessage(chatId, infoMsg);
  
  // Log outgoing message
  await logMessage({
    telegram_user_id: user.id,
    telegram_username: user.username || null,
    telegram_first_name: user.first_name || null,
    telegram_last_name: user.last_name || null,
    message_text: infoMsg,
    direction: 'outgoing',
    message_type: 'text',
  });
});

// Handle document messages (optional - screenshot not required anymore)
bot.on('document', async (msg) => {
  const chatId = msg.chat.id;
  const user = msg.from;
  const document = msg.document;

  if (!user) {
    await bot.sendMessage(chatId, 'Unable to retrieve user information.');
    return;
  }

  // Log incoming document
  await logMessage({
    telegram_user_id: user.id,
    telegram_username: user.username || null,
    telegram_first_name: user.first_name || null,
    telegram_last_name: user.last_name || null,
    message_text: `[Document sent: ${document?.file_name || 'unknown'}]`,
    direction: 'incoming',
    message_type: 'document',
  });

  // Screenshot is no longer required, just inform user
  const infoMsg = '📸 Screenshot is not required. Just send your UID (7 digits) using /start command.';
  await bot.sendMessage(chatId, infoMsg);
  
  // Log outgoing message
  await logMessage({
    telegram_user_id: user.id,
    telegram_username: user.username || null,
    telegram_first_name: user.first_name || null,
    telegram_last_name: user.last_name || null,
    message_text: infoMsg,
    direction: 'outgoing',
    message_type: 'text',
  });
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
