import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
  createSessionValue,
  parseSessionValue,
} from '@/lib/session-cookie';
import { validateSid } from '@/lib/session-db';

// Renew the sliding session once its remaining life drops below this —
// keeps the DB freshness check off the hot path for most requests.
const RENEWAL_THRESHOLD_MS = 30 * 60 * 1000;

function getAllowedIps(): string[] {
  return (process.env.ALLOWED_IPS ?? '')
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean);
}

function stripSid(url: URL): URL {
  const clean = new URL(url);
  clean.searchParams.delete('sid');
  return clean;
}

function withSessionCookie(response: NextResponse, sid: string): NextResponse {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: createSessionValue(sid),
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: SESSION_TTL_MS / 1000,
    path: '/',
  });
  return response;
}

export async function proxy(request: NextRequest) {
  if (process.env.ACCESS_PROTECTION_DISABLED === '1') {
    return NextResponse.next();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp && getAllowedIps().includes(realIp)) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionCookie ? parseSessionValue(sessionCookie) : null;
  const sidParam = request.nextUrl.searchParams.get('sid');

  // A sid that differs from the current session always wins — TM1 handing
  // us a fresh one (e.g. after a re-login) takes priority over whatever
  // cookie we're already carrying, however much life it has left.
  if (sidParam && sidParam !== session?.sid && (await validateSid(sidParam))) {
    return withSessionCookie(NextResponse.redirect(stripSid(request.nextUrl), 302), sidParam);
  }

  if (session) {
    const hasSidParam = sidParam !== null;
    const needsRenewal = session.expiresAt - Date.now() < RENEWAL_THRESHOLD_MS;

    if (needsRenewal) {
      if (await validateSid(session.sid)) {
        const response = hasSidParam
          ? NextResponse.redirect(stripSid(request.nextUrl), 302)
          : NextResponse.next();
        return withSessionCookie(response, session.sid);
      }
      // Underlying session is no longer fresh in the DB — fall through to forbidden.
    } else {
      if (hasSidParam) {
        return NextResponse.redirect(stripSid(request.nextUrl), 302);
      }
      return NextResponse.next();
    }
  }

  return NextResponse.redirect(new URL('/forbidden', request.url), 302);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico$|(?:images|videos|seo|catalog-logos|forbidden)(?:/|$)).*)',
  ],
};
