import { createHmac, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE_NAME = 'apl_session';

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET is not set');
  return secret;
}

function sign(expiryEpochMs: string, secret: string): string {
  return createHmac('sha256', secret).update(expiryEpochMs).digest('hex');
}

export function createSessionValue(): string {
  const secret = getSessionSecret();
  const expiryEpochMs = String(Date.now() + SESSION_TTL_MS);
  return `${expiryEpochMs}.${sign(expiryEpochMs, secret)}`;
}

export function verifySessionValue(value: string): boolean {
  const secret = getSessionSecret();
  const parts = value.split('.');
  if (parts.length !== 2) return false;

  const [expiryEpochMs, hmacHex] = parts;
  const expiry = Number(expiryEpochMs);
  if (!Number.isFinite(expiry) || expiry <= Date.now()) return false;

  const expected = Buffer.from(sign(expiryEpochMs, secret), 'hex');
  const actual = Buffer.from(hmacHex, 'hex');
  if (expected.length !== actual.length) return false;

  return timingSafeEqual(expected, actual);
}
