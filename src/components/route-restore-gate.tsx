'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useTm1TaskId } from '@/components/tm1-task-context';
import { tm1SessionKey, TM1_LAST_PATH_PREFIX } from '@/lib/tm1-session-key';
import { t, type Lang } from '@/lib/i18n';

interface RouteRestoreGateProps {
  lang: Lang;
  children: ReactNode;
}

// Guards the Brand Grid's first paint: if a last-visited in-app route is
// saved for this TM1 task (see route-persistence.tsx), replace to it before
// ever showing the grid, instead of painting the grid and yanking the user
// away from it a moment later. Because this is a Client Component whose
// initial state is `ready: false`, the server-rendered HTML is already the
// spinner — the grid (already fetched server-side, sitting in `children`)
// never paints before the redirect decision is made.
export function RouteRestoreGate({ lang, children }: RouteRestoreGateProps) {
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tid = useTm1TaskId();

  useEffect(() => {
    const query = searchParams.toString();
    const current = query ? `${pathname}?${query}` : pathname;
    try {
      const saved = sessionStorage.getItem(tm1SessionKey(TM1_LAST_PATH_PREFIX, tid));
      if (saved && saved !== '/' && saved !== current) {
        router.replace(saved);
        return;
      }
    } catch {
      // sessionStorage unavailable — nothing to restore, fall through to ready.
    }
    // SSR can't know whether sessionStorage has a saved path — this effect
    // is the only place that decision can be made, so this setState call
    // is unavoidable here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
  }, [tid, router, pathname, searchParams]);

  if (!ready) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{t('loading', lang)}</p>
        <p className="text-sm text-muted-foreground">{t('pleaseWait', lang)}</p>
      </div>
    );
  }

  return <>{children}</>;
}
