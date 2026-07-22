'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const LAST_PATH_KEY = 'apl-eds:last-path';

// When embedded as a TM1 iframe (see temp/NEXT_CATALOGUE_IFRAME_REFRESH_BEHAVIOR.md),
// the parent refreshing its own tab recreates our iframe at the fixed entry URL
// ('/'), discarding whatever the user had navigated to. This restores it.
//
// TM1 can host several of our iframes at once (one per TM1 task tab), all
// same-origin and sharing one sessionStorage bucket — so the key is
// namespaced by `tid` (TM1's task id, passed once on the entry URL) to stop
// tabs from restoring each other's path. Falls back to a shared key when
// `tid` is absent (local dev, direct access, or before TM1 adds it).
export function RoutePersistence() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasCheckedInitialLoad = useRef(false);
  const storageKey = useRef(LAST_PATH_KEY);

  // Runs once per real page load (this component lives in the root layout
  // and isn't remounted by client-side navigation) — never on a client nav.
  // A genuine deep link (pathname !== '/') is left untouched.
  useEffect(() => {
    if (hasCheckedInitialLoad.current) return;
    hasCheckedInitialLoad.current = true;
    const tid = searchParams.get('tid');
    if (tid) storageKey.current = `${LAST_PATH_KEY}:${tid}`;
    if (pathname !== '/') return;
    try {
      const saved = sessionStorage.getItem(storageKey.current);
      if (saved && saved !== '/') router.replace(saved);
    } catch {
      // sessionStorage unavailable (e.g. partitioned/blocked third-party
      // storage in a cross-origin iframe) — just stay on '/'.
    }
  }, [pathname, searchParams, router]);

  // Record every navigation so the restore above has something to recover.
  useEffect(() => {
    const query = searchParams.toString();
    const current = query ? `${pathname}?${query}` : pathname;
    try {
      sessionStorage.setItem(storageKey.current, current);
    } catch {
      // ignore — see above
    }
  }, [pathname, searchParams]);

  return null;
}
