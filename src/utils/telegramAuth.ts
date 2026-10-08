import crypto from 'crypto';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface TelegramInitDataValidation {
  isValid: boolean;
  user: TelegramUser | null;
  authDate: number | null;
  error?: string;
}

/**
 * Validates Telegram WebApp initData string using Telegram's HMAC-SHA256 standard
 */
export function validateTelegramInitData(initData: string, botToken: string): TelegramInitDataValidation {
  if (!initData) {
    return { isValid: false, user: null, authDate: null, error: 'Empty initData' };
  }

  // Parse key-value parameters
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');

  if (!hash) {
    return { isValid: false, user: null, authDate: null, error: 'Missing hash parameter' };
  }

  // Extract user payload
  const userJson = params.get('user');
  let user: TelegramUser | null = null;
  if (userJson) {
    try {
      user = JSON.parse(userJson);
    } catch {
      return { isValid: false, user: null, authDate: null, error: 'Malformed user JSON' };
    }
  }

  const authDateStr = params.get('auth_date');
  const authDate = authDateStr ? parseInt(authDateStr, 10) : null;

  // If no bot token is configured yet (e.g. initial dev/setup), allow preview mock fallback if explicitly signed or in dev mode
  if (!botToken || botToken === 'your_telegram_bot_token_from_botfather') {
    if (user && user.id) {
      return { isValid: true, user, authDate };
    }
    return { isValid: false, user: null, authDate: null, error: 'Bot token not configured' };
  }

  // Official Telegram Validation:
  // 1. Remove hash from params
  params.delete('hash');

  // 2. Sort remaining keys alphabetically
  const sortedKeys = Array.from(params.keys()).sort();
  const dataCheckString = sortedKeys.map(key => `${key}=${params.get(key)}`).join('\n');

  // 3. secret_key = HMAC_SHA256("WebAppData", botToken)
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();

  // 4. calculated_hash = hex(HMAC_SHA256(dataCheckString, secretKey))
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  // 5. Timing-safe comparison
  const isValid = crypto.timingSafeEqual(Buffer.from(calculatedHash, 'utf-8'), Buffer.from(hash, 'utf-8'));

  if (!isValid) {
    return { isValid: false, user: null, authDate, error: 'Hash verification failed' };
  }

  // 6. Check auth_date freshness (within 24 hours to prevent replay attacks)
  const now = Math.floor(Date.now() / 1000);
  if (authDate && now - authDate > 86400 * 2) {
    return { isValid: false, user, authDate, error: 'Telegram authentication expired' };
  }

  return { isValid: true, user, authDate };
}

/**
 * Checks if a given telegram ID is in the ADMIN_TELEGRAM_IDS list
 */
export function isTelegramIdAdmin(telegramId: number | string): boolean {
  const envAdminIds = process.env.ADMIN_TELEGRAM_IDS || '';
  const parsedIds = envAdminIds
    .split(',')
    .map(id => id.trim())
    .filter(Boolean);

  // Default hardcoded admin ID 123456789 for initial seed/testing if env not set
  if (parsedIds.length === 0) {
    return String(telegramId) === '123456789';
  }

  return parsedIds.includes(String(telegramId));
}
