'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const LAST_PATH_KEY = 'apl-eds:last-path';

// When embedded as a TM1 iframe (see temp/NEXT_CATALOGUE_IFRAME_REFRESH_BEHAVIOR.md),
// the parent refreshing its own tab recreates our iframe at the fixed entry URL
// ('/'), discarding whatever the user had navigated to. This restores it.
export function RoutePersistence() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasCheckedInitialLoad = useRef(false);

  // Runs once per real page load (this component lives in the root layout
  // and isn't remounted by client-side navigation) — never on a client nav.
  // A genuine deep link (pathname !== '/') is left untouched.
  useEffect(() => {
    if (hasCheckedInitialLoad.current) return;
    hasCheckedInitialLoad.current = true;
    if (pathname !== '/') return;
    try {
      const saved = sessionStorage.getItem(LAST_PATH_KEY);
      if (saved && saved !== '/' && saved !== '/forbidden') router.replace(saved);
    } catch {
      // sessionStorage unavailable (e.g. partitioned/blocked third-party
      // storage in a cross-origin iframe) — just stay on '/'.
    }
  }, [pathname, router]);

  // Record every navigation so the restore above has something to recover.
  // Never record '/forbidden' itself — a fresh, validly-authenticated load
  // must not get bounced straight back into the 403 wall by the restore above.
  useEffect(() => {
    if (pathname === '/forbidden') return;
    const query = searchParams.toString();
    const current = query ? `${pathname}?${query}` : pathname;
    try {
      sessionStorage.setItem(LAST_PATH_KEY, current);
    } catch {
      // ignore — see above
    }
  }, [pathname, searchParams]);

  return null;
}
