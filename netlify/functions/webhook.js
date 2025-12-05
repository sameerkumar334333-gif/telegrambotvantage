"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const bot_1 = require("../../dist/bot/bot");
const handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }
    try {
        const update = JSON.parse(event.body || '{}');
        await bot_1.bot.processUpdate(update);
        return {
            statusCode: 200,
            body: JSON.stringify({ ok: true }),
        };
    }
    catch (error) {
        console.error('Error processing webhook:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
exports.handler = handler;
//# sourceMappingURL=webhook.js.map