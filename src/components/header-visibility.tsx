'use client';

import { usePathname } from 'next/navigation';

export function HeaderVisibility({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith('/catalog/') || pathname === '/forbidden') return null;
  return <>{children}</>;
}
