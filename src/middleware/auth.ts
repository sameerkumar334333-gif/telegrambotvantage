import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { config } from '../config';

const ADMIN_USERNAME = config.adminUsername;
const ADMIN_PASSWORD = config.adminPassword;

if (!ADMIN_PASSWORD) {
  console.warn('Warning: ADMIN_PASSWORD is not set. Using default password.');
}

// Hash the password on first load (in production, you'd hash it once and store the hash)
let hashedPassword: string | null = null;

async function getHashedPassword(): Promise<string> {
  if (!hashedPassword && ADMIN_PASSWORD) {
    hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  }
  return hashedPassword || '';
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (req.session?.authenticated) {
    next();
    return;
  }

  res.status(401).json({ error: 'Unauthorized' });
}

export async function checkCredentials(username: string, password: string): Promise<boolean> {
  if (username !== ADMIN_USERNAME) {
    return false;
  }

  if (!ADMIN_PASSWORD) {
    return false;
  }

  const hash = await getHashedPassword();
  return await bcrypt.compare(password, hash);
}
