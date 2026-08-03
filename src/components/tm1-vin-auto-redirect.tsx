'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCustomerData } from '@/lib/tm1-bridge';

const SESSION_FLAG_PREFIX = 'apl-eds-tm1-vin-autocheck';

// TM1 can host several of our iframes at once (one per TM1 task tab), all
// same-origin and sharing one sessionStorage bucket — so the flag is
// namespaced by `tid` (TM1's task id, passed once on the entry URL). Without
// this, checking once on one task's tab would permanently block the check on
// every other task opened afterwards in the same browser session.
function flagKey(tid: string | null): string {
  return tid ? `${SESSION_FLAG_PREFIX}:${tid}` : SESSION_FLAG_PREFIX;
}

// On a TM1 task that already has a vehicle attached, jump straight into its
// catalog instead of making the user pick a brand from scratch. TM1 doesn't
// pass the VIN in the iframe URL itself (no such parameter exists on their
// side yet) — this reuses the getCustomerData postMessage command we already
// rely on elsewhere to read it ourselves. Guarded by a per-task sessionStorage
// flag so navigating back to "/" mid-task (e.g. the "Начало" breadcrumb)
// doesn't keep re-redirecting away from a deliberate return to the Brand Grid.
export function Tm1VinAutoRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ranRef = useRef(false);
  const tid = searchParams.get('tid');

  useEffect(() => {
    if (searchParams.get('vin') || ranRef.current) return;
    if (typeof window === 'undefined' || window.self === window.top) return;
    if (sessionStorage.getItem(flagKey(tid))) return;
    ranRef.current = true;
    sessionStorage.setItem(flagKey(tid), '1');

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
