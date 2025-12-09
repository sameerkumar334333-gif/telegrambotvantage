import { Router, Request, Response } from 'express';
import { checkCredentials, requireAuth } from '../middleware/auth';
import path from 'path';

const router = Router();

// POST /admin/login - Handle login
router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  const isValid = await checkCredentials(username, password);

  if (isValid) {
    req.session.authenticated = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// POST /admin/logout - Handle logout
router.post('/logout', (req: Request, res: Response) => {
  if (req.session) {
    req.session.authenticated = false;
  }
  res.json({ success: true });
});

// GET /admin - Serve admin panel (frontend handles auth check)
router.get('/', (req: Request, res: Response) => {
  // Handle both development and production paths
  const adminPath = path.join(process.cwd(), 'public', 'admin.html');
  const distAdminPath = path.join(process.cwd(), 'dist', 'public', 'admin.html');
  
  // Try dist first (production), then root (development)
  const filePath = require('fs').existsSync(distAdminPath) ? distAdminPath : adminPath;
  
  res.sendFile(path.resolve(filePath), (err) => {
    if (err) {
      console.error('Error sending admin.html:', err);
      res.status(500).send('Error loading admin panel');
    }
  });
});

// GET /admin/check - Check if user is authenticated
router.get('/check', (req: Request, res: Response) => {
  if (req.session?.authenticated) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});

export default router;

