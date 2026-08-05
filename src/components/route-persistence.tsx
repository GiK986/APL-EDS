'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTm1TaskId } from '@/components/tm1-task-context';
import { tm1SessionKey, TM1_LAST_PATH_PREFIX } from '@/lib/tm1-session-key';

// When embedded as a TM1 iframe (see temp/NEXT_CATALOGUE_IFRAME_REFRESH_BEHAVIOR.md),
// the parent refreshing its own tab recreates our iframe at the fixed entry URL
// ('/'), discarding whatever the user had navigated to. RouteRestoreGate
// (src/components/route-restore-gate.tsx) is what restores it on the Brand
// Grid page — this component only records navigations for that restore to
// read later, namespaced by TM1's task id (tm1-task-context.tsx) so TM1's
// several same-origin iframes don't clobber each other's sessionStorage
// entries.
export function RoutePersistence() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tid = useTm1TaskId();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip this iframe's boot state — whatever raw entry URL TM1 created it
    // with (possibly carrying a one-shot Bearer token) is not a real in-app
    // route, and must never be replayed later.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const query = searchParams.toString();
    const current = query ? `${pathname}?${query}` : pathname;
    try {
      sessionStorage.setItem(tm1SessionKey(TM1_LAST_PATH_PREFIX, tid), current);
    } catch {
      // sessionStorage unavailable (e.g. partitioned/blocked third-party
      // storage in a cross-origin iframe) — ignore, nothing to persist.
    }
  }, [pathname, searchParams, tid]);

  return null;
}
