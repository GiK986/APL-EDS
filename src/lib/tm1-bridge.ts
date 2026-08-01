'use client';

import { useSyncExternalStore } from 'react';

// Next Catalogue (TM1) embeds external modules in an iframe and listens for
// window.postMessage commands (see temp/NEXT_CATALOGUE_POSTMESSAGE_BASKET.md).
// This is reverse-engineered from TM1's bundle, not a documented contract —
// it can break silently if TM1 changes its dispatcher.
export const TM1_ORIGIN = 'https://tm1.carparts-cat.com';

// We can only reliably detect "are we framed at all" — there's no way to
// confirm the parent is specifically TM1 without it acknowledging us first.
// window.top access itself never throws cross-origin (only reading its
// properties does), so this check is safe even when cross-origin framed.
// It never changes after mount, so subscribe is a no-op — useSyncExternalStore
// just gives us a safe, hydration-mismatch-free way to read it once.
function subscribeNoop() {
  return () => {};
}
function getIsEmbeddedSnapshot() {
  return window.self !== window.top;
}
function getServerSnapshot() {
  return false;
}

export function useIsTm1Embedded(): boolean {
  return useSyncExternalStore(subscribeNoop, getIsEmbeddedSnapshot, getServerSnapshot);
}

// TM1's dispatcher accepts a JSON string (matches the addPartsToBasket
// example captured live) — no confirmed postMessage response for this
// command, so this is fire-and-forget.
//
// searchFilter: 66 = SearchFilters.OeReference | TradeReference_KARTREF — required,
// otherwise openArticleList falls back to a plain text search that can match the
// wrong article. useNewModal only takes effect if the TM1 tenant has the
// useShowNewArticleList feature flag on; if it's off, TM1 falls back to the old
// floating "(1)" modal on its own.
export function openOeAftermarket(oeNumber: string): void {
  window.parent.postMessage(
    JSON.stringify({
      openArticleList: {
        direct: { query: oeNumber, searchFilter: 66 },
        inModal: true,
        useNewModal: true,
      },
    }),
    TM1_ORIGIN
  );
}

// Sets the vehicle on TM1's currently-open work task from a TecDoc K-Type
// number alone — TM1 loads the full vehicle record itself server-side (see
// module 691990 / channel "VEHICLE/SET_VEHICLE_TECDOC_NUMBER" in TM1's own
// bundle). No confirmed postMessage response for this command either.
export function setVehicleTecDocNumber(tecDocNumber: number, vehicleType?: number): void {
  window.parent.postMessage(
    JSON.stringify({
      setVehicleTecDocNumber: { tecDocNumber, ...(vehicleType && { vehicleType }) },
    }),
    TM1_ORIGIN
  );
}

// Merges VIN (and other identity fields) onto whatever vehicle is already
// attached to the current work task (module 80936) — a no-op if no vehicle
// is attached yet. Must be sent after setVehicleTecDocNumber, not before:
// that command resolves asynchronously (it fetches the full TecDoc model
// before attaching), and this one only has something to merge onto once
// that attach has actually happened.
export function setVehicleProperties(props: {
  vin?: string;
  plateId?: string;
  mileAge?: string;
  initialRegistration?: string;
}): void {
  window.parent.postMessage(JSON.stringify({ setVehicleProperties: props }), TM1_ORIGIN);
}

// Separate command from setVehicleProperties (module 250749 in TM1's bundle,
// live-verified) — engine code isn't one of setVehicleProperties's mergeable
// fields. Same merge-onto-attached-vehicle requirement: no-op if no vehicle
// is attached to the task yet.
export function setEngineCode(engineCode: string): void {
  window.parent.postMessage(JSON.stringify({ setEngineCode: { engineCode } }), TM1_ORIGIN);
}

export interface TM1VehicleData {
  licensePlate?: string;
  milageInKm?: number;
  vin?: string;
  initialRegistration?: string;
  nextGeneralInspection?: string;
  lastGeneralInspection?: string;
  nextServiceDate?: string;
  kba?: string;
}

export interface TM1CustomerData {
  traderDescription?: string;
  customer?: { name?: string };
  vehicle?: TM1VehicleData;
}

const GET_CUSTOMER_DATA_TIMEOUT_MS = 4000;

// Request/response pair (module 157113 in TM1's bundle, live-verified): TM1 posts
// back { setCustomerData: {...} } with a `vehicle` key that's entirely absent
// (not null) when the current work task has no vehicle attached yet — the only
// reliable signal we have for "is it safe to attach a vehicle to this task".
export function getCustomerData(): Promise<TM1CustomerData | null> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      window.removeEventListener('message', handler);
      resolve(null);
    }, GET_CUSTOMER_DATA_TIMEOUT_MS);

    function handler(event: MessageEvent) {
      if (event.origin !== TM1_ORIGIN) return;
      let data: unknown = event.data;
      try {
        if (typeof data === 'string') data = JSON.parse(data);
      } catch {
        return;
      }
      if (data && typeof data === 'object' && 'setCustomerData' in data) {
        clearTimeout(timeout);
        window.removeEventListener('message', handler);
        resolve((data as { setCustomerData: TM1CustomerData }).setCustomerData);
      }
    }

    window.addEventListener('message', handler);
    window.parent.postMessage(JSON.stringify({ getCustomerData: true }), TM1_ORIGIN);
  });
}
