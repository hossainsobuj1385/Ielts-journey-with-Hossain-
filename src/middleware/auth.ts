import { Request, Response, NextFunction } from 'express';
import { validateTelegramInitData, isTelegramIdAdmin, TelegramUser } from '../utils/telegramAuth';
import { findOrCreateUser, UserRecord } from '../services/appService';

export interface AuthenticatedRequest extends Request {
  user?: UserRecord;
  telegramUser?: TelegramUser;
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const initData = (req.headers['x-telegram-init-data'] as string) || '';
    const authHeader = req.headers.authorization || '';
    const botToken = process.env.BOT_TOKEN || '';

    // Check custom preview header or token
    const customTelegramId = req.headers['x-telegram-user-id'] as string;

    if (initData) {
      const validation = validateTelegramInitData(initData, botToken);
      if (validation.isValid && validation.user) {
        req.telegramUser = validation.user;
        const user = await findOrCreateUser({
          telegram_id: validation.user.id,
          first_name: validation.user.first_name,
          last_name: validation.user.last_name,
          username: validation.user.username,
          photo_url: validation.user.photo_url,
          language: validation.user.language_code
        });
        req.user = user;
        return next();
      }
    }

    // Fallback for preview or direct browser access:
    // If a customTelegramId is passed in header or session query
    if (customTelegramId) {
      const parsedId = parseInt(customTelegramId, 10);
      if (!isNaN(parsedId)) {
        const user = await findOrCreateUser({
          telegram_id: parsedId,
          first_name: req.headers['x-telegram-first-name'] ? decodeURIComponent(req.headers['x-telegram-first-name'] as string) : 'Preview Student',
          username: (req.headers['x-telegram-username'] as string) || 'student_preview'
        });
        req.user = user;
        return next();
      }
    }

    // Default demo fallback user (User 1 - Hossain) if running in dev preview without Telegram client
    const fallbackUser = await findOrCreateUser({
      telegram_id: 123456789,
      first_name: 'Hossain',
      last_name: 'Ahmad',
      username: 'hossain_ielts'
    });
    req.user = fallbackUser;
    return next();
  } catch (err: any) {
    console.error('[AuthMiddleware] Error authenticating request:', err);
    res.status(401).json({ error: 'Authentication failed', details: err.message });
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const isAdmin = isTelegramIdAdmin(req.user.telegram_id);
  if (!isAdmin) {
    res.status(403).json({ error: 'Access denied: Admin privileges required' });
    return;
  }

  req.user.isAdmin = true;
  next();
}
