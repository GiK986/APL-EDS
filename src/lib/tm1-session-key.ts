// TM1 can host several of our iframes at once (one per TM1 task tab), all
// same-origin and sharing one sessionStorage bucket — so every per-task flag
// or cache value is namespaced by TM1's task id to stop tabs from clobbering
// each other. Falls back to the bare prefix when `tid` is absent (local dev,
// direct access, or before TM1 adds it).
export function tm1SessionKey(prefix: string, tid: string | null): string {
  return tid ? `${prefix}:${tid}` : prefix;
}

export const TM1_LAST_PATH_PREFIX = 'apl-eds:last-path';

// Shared by route-persistence.tsx (writer) and route-restore-gate.tsx
// (reader) so their notion of "the current path" can never drift apart —
// a mismatch here would reintroduce the redirect-loop/hang bug those two
// files coordinate to avoid.
export function currentPath(pathname: string, searchParams: URLSearchParams): string {
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}
