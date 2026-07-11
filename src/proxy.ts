import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, createSessionValue, verifySessionValue } from '@/lib/session-cookie';
import { validateSid } from '@/lib/session-db';

const SESSION_COOKIE_MAX_AGE_SECONDS = 8 * 60 * 60;

function getAllowedIps(): string[] {
  return (process.env.ALLOWED_IPS ?? '')
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean);
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
  if (sessionCookie && verifySessionValue(sessionCookie)) {
    // TM1 appends ?sid= on every iframe load — strip it so it never lingers
    // in browser history / sessionStorage once a valid session cookie exists.
    if (request.nextUrl.searchParams.has('sid')) {
      const cleanUrl = new URL(request.nextUrl);
      cleanUrl.searchParams.delete('sid');
      return NextResponse.redirect(cleanUrl, 302);
    }
    return NextResponse.next();
  }

  const sid = request.nextUrl.searchParams.get('sid');
  if (sid && (await validateSid(sid))) {
    const redirectUrl = new URL(request.nextUrl);
    redirectUrl.searchParams.delete('sid');
    const response = NextResponse.redirect(redirectUrl, 302);
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: createSessionValue(),
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
      path: '/',
    });
    return response;
  }

  return NextResponse.rewrite(new URL('/forbidden', request.url));
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico$|(?:images|videos|seo|catalog-logos|forbidden)(?:/|$)).*)',
  ],
};
