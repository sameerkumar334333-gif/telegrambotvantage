import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import path from 'path';
import { config } from './config';
import adminRoutes from './routes/admin';
import apiRoutes from './routes/api';
import { bot } from './bot/bot'; // Initialize bot

dotenv.config();

const app = express();
const PORT = process.env.PORT || config.port || '3000';
const SESSION_SECRET = process.env.SESSION_SECRET || config.sessionSecret || 'change-this-secret-in-production';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
// Note: MemoryStore is fine for single-instance deployments like Render
// For multi-instance, consider Redis or database-backed session store
app.use(
  session({
    secret: SESSION_SECRET,
    resave: true, // Save session even if not modified (needed for some cases)
    saveUninitialized: true, // Create session even if nothing stored (needed for auth check)
    cookie: {
      secure: false, // Set to false for Render (they handle HTTPS at load balancer)
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax', // Help with cookie handling
    },
    name: 'admin.sid', // Custom session name
  })
);

// Root route - redirect to admin panel (must be before other routes)
app.get('/', (req, res) => {
  res.redirect('/admin');
});

// Routes - IMPORTANT: Register routes BEFORE static files
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);

// Serve static files from public directory (handle both dev and production)
const publicPath = require('fs').existsSync(path.join(process.cwd(), 'dist', 'public'))
  ? path.join(process.cwd(), 'dist', 'public')
  : path.join(process.cwd(), 'public');
app.use(express.static(publicPath));

// Webhook endpoint for Telegram bot (Render/Netlify)
if (process.env.RENDER === 'true' || process.env.USE_WEBHOOK === 'true') {
  app.post('/webhook', (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });
  
  // Get webhook info endpoint (for debugging)
  app.get('/webhook-info', async (req, res) => {
    try {
      const info = await bot.getWebHookInfo();
      res.json(info);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 404 handler for undefined routes
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, async () => {
  console.log('='.repeat(50));
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`✅ Admin panel: http://localhost:${PORT}/admin`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log('='.repeat(50));
  
  // Auto-setup webhook for Render
  if (process.env.RENDER === 'true' && process.env.RENDER_EXTERNAL_URL) {
    try {
      const webhookUrl = `${process.env.RENDER_EXTERNAL_URL}/webhook`;
      console.log(`Setting up webhook for Render: ${webhookUrl}`);
      await bot.setWebHook(webhookUrl);
      const webhookInfo = await bot.getWebHookInfo();
      console.log('✅ Webhook configured successfully!');
      console.log('Webhook info:', JSON.stringify(webhookInfo, null, 2));
    } catch (error) {
      console.error('❌ Failed to setup webhook:', error);
      console.error('Bot will not receive updates until webhook is configured');
    }
  } else if (process.env.RENDER === 'true') {
    console.log('⚠️  Warning: RENDER_EXTERNAL_URL not set. Webhook will not be configured automatically.');
  }
});
