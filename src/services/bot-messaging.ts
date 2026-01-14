import { bot } from '../bot/bot';
import { logMessage } from './message-logger';
import { supabase } from './supabase';

const VERIFICATION_MESSAGE = `🎉 Congratulations! You're Verified!

Welcome to the VIP Wolf of Forex Community! Join our exclusive trading channel and start making money with us.

🔗 Join VIP Channel: https://t.me/+K3Qy0ILna8U5MTg1

Happy Trading! 🚀`;

const REJECTION_MESSAGE = `❌ Your submission has been rejected.

Please deposit $50 and resubmit your screenshot for verification.

If you have any questions or need assistance, please contact our team:
👥 Contact Team: @teamwof

We're here to help! 💪`;

/**
 * Get user info from database for logging
 */
async function getUserInfo(telegramUserId: number) {
  try {
    const { data } = await supabase
      .from('submissions')
      .select('telegram_username, telegram_first_name, telegram_last_name')
      .eq('telegram_user_id', telegramUserId)
      .limit(1)
      .single();

    return data || null;
  } catch (error) {
    return null;
  }
}

/**
 * Send verification message to user when their submission is approved
 */
export async function sendVerificationMessage(telegramUserId: number): Promise<boolean> {
  try {
    await bot.sendMessage(telegramUserId, VERIFICATION_MESSAGE);
    
    // Log the message
    const userInfo = await getUserInfo(telegramUserId);
    await logMessage({
      telegram_user_id: telegramUserId,
      telegram_username: userInfo?.telegram_username || null,
      telegram_first_name: userInfo?.telegram_first_name || null,
      telegram_last_name: userInfo?.telegram_last_name || null,
      message_text: VERIFICATION_MESSAGE,
      direction: 'outgoing',
      message_type: 'text',
    });
    
    return true;
  } catch (error) {
    console.error(`Error sending verification message to user ${telegramUserId}:`, error);
    return false;
  }
}

/**
 * Send rejection message to user
 */
export async function sendRejectionMessage(telegramUserId: number): Promise<boolean> {
  try {
    await bot.sendMessage(telegramUserId, REJECTION_MESSAGE);
    
    // Log the message
    const userInfo = await getUserInfo(telegramUserId);
    await logMessage({
      telegram_user_id: telegramUserId,
      telegram_username: userInfo?.telegram_username || null,
      telegram_first_name: userInfo?.telegram_first_name || null,
      telegram_last_name: userInfo?.telegram_last_name || null,
      message_text: REJECTION_MESSAGE,
      direction: 'outgoing',
      message_type: 'text',
    });
    
    return true;
  } catch (error) {
    console.error(`Error sending rejection message to user ${telegramUserId}:`, error);
    return false;
  }
}

/**
 * Send custom message to user
 */
export async function sendCustomMessage(telegramUserId: number, message: string): Promise<boolean> {
  try {
    await bot.sendMessage(telegramUserId, message);
    
    // Log the message
    const userInfo = await getUserInfo(telegramUserId);
    await logMessage({
      telegram_user_id: telegramUserId,
      telegram_username: userInfo?.telegram_username || null,
      telegram_first_name: userInfo?.telegram_first_name || null,
      telegram_last_name: userInfo?.telegram_last_name || null,
      message_text: message,
      direction: 'outgoing',
      message_type: 'text',
    });
    
    return true;
  } catch (error) {
    console.error(`Error sending custom message to user ${telegramUserId}:`, error);
    return false;
  }
}

