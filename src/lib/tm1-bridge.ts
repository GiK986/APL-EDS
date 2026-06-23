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
export function openOeAftermarket(oeNumber: string): void {
  window.parent.postMessage(JSON.stringify({ openOeAftermarket: { oeNumber } }), TM1_ORIGIN);
}
