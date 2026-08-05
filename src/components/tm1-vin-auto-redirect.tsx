'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCustomerData } from '@/lib/tm1-bridge';
import { useTm1TaskId } from '@/components/tm1-task-context';
import { tm1SessionKey } from '@/lib/tm1-session-key';

const SESSION_FLAG_PREFIX = 'apl-eds-tm1-vin-autocheck';

// On a TM1 task that already has a vehicle attached, jump straight into its
// catalog instead of making the user pick a brand from scratch. TM1 doesn't
// pass the VIN in the iframe URL itself (no such parameter exists on their
// side yet) — this reuses the getCustomerData postMessage command we already
// rely on elsewhere to read it ourselves. Guarded by a per-task sessionStorage
// flag, namespaced via Tm1TaskProvider's frozen tid rather than re-read from
// the current URL — that was the bug: a breadcrumb link back to a bare "/"
// made this component think it was a brand-new task and re-fire, so
// navigating back to "/" mid-task (e.g. the "Начало" breadcrumb) doesn't keep
// re-redirecting away from a deliberate return to the Brand Grid.
export function Tm1VinAutoRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ranRef = useRef(false);
  const tid = useTm1TaskId();

  useEffect(() => {
    if (searchParams.get('vin') || ranRef.current) return;
    if (typeof window === 'undefined' || window.self === window.top) return;
    const flagKey = tm1SessionKey(SESSION_FLAG_PREFIX, tid);
    if (sessionStorage.getItem(flagKey)) return;
    ranRef.current = true;
    sessionStorage.setItem(flagKey, '1');

    getCustomerData().then((data) => {
      if (data?.vehicle?.vin) {
        // Carry `tid` forward — otherwise this hop drops it from the URL.
        const params = new URLSearchParams({ vin: data.vehicle.vin });
        if (tid) params.set('tid', tid);
        router.replace(`/?${params}`);
      }
    });
  }, [searchParams, router, tid]);

  return null;
}
