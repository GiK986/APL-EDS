import { createHmac, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE_NAME = 'apl_session';

export const SESSION_TTL_MS = 3 * 60 * 60 * 1000;

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET is not set');
  return secret;
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export function createSessionValue(sid: string): string {
  const secret = getSessionSecret();
  const sidEncoded = Buffer.from(sid, 'utf8').toString('base64url');
  const expiresAt = String(Date.now() + SESSION_TTL_MS);
  const payload = `${sidEncoded}.${expiresAt}`;
  return `${payload}.${sign(payload, secret)}`;
}

export interface SessionData {
  sid: string;
  expiresAt: number;
}

export function parseSessionValue(value: string): SessionData | null {
  const secret = getSessionSecret();
  const parts = value.split('.');
  if (parts.length !== 3) return null;

  const [sidEncoded, expiresAtStr, hmacHex] = parts;
  const payload = `${sidEncoded}.${expiresAtStr}`;
  const expected = Buffer.from(sign(payload, secret), 'hex');
  const actual = Buffer.from(hmacHex, 'hex');
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return null;

  const sid = Buffer.from(sidEncoded, 'base64url').toString('utf8');
  if (!sid) return null;

  return { sid, expiresAt };
}
