'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCustomerData } from '@/lib/tm1-bridge';
import { useTm1TaskId } from '@/components/tm1-task-context';
import { tm1SessionKey } from '@/lib/tm1-session-key';
import { isValidVin } from '@/lib/vin';

const SESSION_FLAG_PREFIX = 'apl-eds-tm1-vin-autocheck';

// On a TM1 task that already has a vehicle attached, jump straight into its
// catalog instead of making the user pick a brand from scratch. TM1's entry
// URL doesn't carry a real VIN — only its own internal vehicle GUID (which
// isValidVin rejects) — so this reuses the getCustomerData postMessage
// command we already rely on elsewhere to read the actual VIN ourselves.
// Guarded by a per-task sessionStorage flag, namespaced via Tm1TaskProvider's
// frozen tid rather than re-read from the current URL — that was the bug: a
// breadcrumb link back to a bare "/" made this component think it was a
// brand-new task and re-fire, so navigating back to "/" mid-task (e.g. the
// "Начало" breadcrumb) doesn't keep re-redirecting away from a deliberate
// return to the Brand Grid.
export function Tm1VinAutoRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ranRef = useRef(false);
  const tid = useTm1TaskId();

  useEffect(() => {
    if (isValidVin(searchParams.get('vin') ?? '') || ranRef.current) return;
    if (typeof window === 'undefined' || window.self === window.top) return;
    const flagKey = tm1SessionKey(SESSION_FLAG_PREFIX, tid);
    try {
      if (sessionStorage.getItem(flagKey)) return;
      sessionStorage.setItem(flagKey, '1');
    } catch {
      // sessionStorage unavailable (e.g. partitioned/blocked third-party
      // storage in a cross-origin iframe) — can't read OR write the
      // once-per-task flag, so treat it the same as "flag already set" and
      // bail: proceeding without a working flag would let this redirect
      // re-fire on every subsequent render/navigation instead of just once.
      return;
    }
    ranRef.current = true;

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
