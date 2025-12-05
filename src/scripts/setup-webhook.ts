import TelegramBot from 'node-telegram-bot-api';
import { config } from '../config';

const token = config.telegramBotToken;
const webhookUrl = process.argv[2] || process.env.WEBHOOK_URL;

if (!token) {
  console.error('Error: TELEGRAM_BOT_TOKEN is not set');
  process.exit(1);
}

if (!webhookUrl) {
  console.error('Error: Webhook URL is required');
  console.log('Usage: npm run setup-webhook <webhook-url>');
  console.log('Example: npm run setup-webhook https://your-site.netlify.app/.netlify/functions/webhook');
  process.exit(1);
}

const bot = new TelegramBot(token);

async function setupWebhook() {
  try {
    console.log(`Setting up webhook: ${webhookUrl}`);
    await bot.setWebHook(webhookUrl);
    const webhookInfo = await bot.getWebHookInfo();
    console.log('Webhook set successfully!');
    console.log('Webhook info:', JSON.stringify(webhookInfo, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error setting up webhook:', error);
    process.exit(1);
  }
}

setupWebhook();
