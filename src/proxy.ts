import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// TM1's LANGUAGE_ID codes, mapped to our `lang` cookie values.
const TM1_LANGUAGE_IDS: Record<string, 'bg' | 'en'> = {
  '32': 'bg',
  '4': 'en',
};

// TM1 embeds the app with `?lid=<LANGUAGE_ID>` on every full iframe (re)load.
// The app itself reads language from the `lang` cookie (see
// src/actions/yq.ts), not from the URL, so this is what actually applies
// TM1's language choice.
export function proxy(request: NextRequest) {
  const lid = request.nextUrl.searchParams.get('lid');
  const lang = lid ? TM1_LANGUAGE_IDS[lid] : undefined;
  if (!lang) return NextResponse.next();

  const response = NextResponse.next();
  response.cookies.set('lang', lang, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'none',
    secure: true,
  });
  return response;
}

export const config = {
  matcher: '/',
};
