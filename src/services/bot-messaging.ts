import { bot } from '../bot/bot';

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
 * Send verification message to user when their submission is approved
 */
export async function sendVerificationMessage(telegramUserId: number): Promise<boolean> {
  try {
    await bot.sendMessage(telegramUserId, VERIFICATION_MESSAGE);
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
    return true;
  } catch (error) {
    console.error(`Error sending custom message to user ${telegramUserId}:`, error);
    return false;
  }
}

