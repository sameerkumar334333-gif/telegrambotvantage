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
  res.sendFile(path.join(__dirname, '../../public/admin.html'));
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

