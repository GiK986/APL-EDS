'use client';

import { createContext, useContext, useState, type ComponentProps, type ReactNode } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const Tm1TaskIdContext = createContext<string | null>(null);

// Captured exactly once, on this iframe instance's true first render, from
// the `tid` TM1 puts on our entry URL. TM1 opens every task in its own fresh
// iframe (live-verified: switching TM1's own task tabs changes
// `window.__NEXT_WORKTASKID__` without recreating our iframe), so a value
// captured at mount stays correct for this iframe's whole life — internal
// client-side navigation (e.g. a breadcrumb link to a bare `/`) never changes
// it. That's the fix: components used to independently re-read `tid` from
// `useSearchParams()` on every render, so a link that dropped it made one
// component think it was looking at a brand-new task while another still
// remembered the real one.
export function Tm1TaskProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const [tid] = useState(() => searchParams.get('tid'));
  return <Tm1TaskIdContext.Provider value={tid}>{children}</Tm1TaskIdContext.Provider>;
}

export function useTm1TaskId(): string | null {
  return useContext(Tm1TaskIdContext);
}

type Tm1LinkProps = ComponentProps<typeof Link>;

// Wrapper around next/link that appends the current TM1 task id to any
// relative href pointing back into our own app, so callers (breadcrumbs, etc.)
// never need to remember to carry it forward themselves.
export function Tm1Link({ href, ...props }: Tm1LinkProps) {
  const tid = useTm1TaskId();
  const resolvedHref = typeof href === 'string' ? withTid(href, tid) : href;
  return <Link href={resolvedHref} {...props} />;
}

function withTid(href: string, tid: string | null): string {
  if (!tid) return href;
  const [path, query] = href.split('?');
  const params = new URLSearchParams(query);
  params.set('tid', tid);
  return `${path}?${params}`;
}
