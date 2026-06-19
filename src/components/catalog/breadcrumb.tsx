import Link from 'next/link';
import { ChevronRight, Play } from 'lucide-react';

export interface BreadcrumbSegment {
  label: string;
  href?: string;
  nav?: {
    prevHref?: string;
    nextHref?: string;
  };
}

interface BreadcrumbProps {
  segments: BreadcrumbSegment[];
}

export function Breadcrumb({ segments }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1.5 overflow-x-auto text-sm text-muted-foreground">
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-1.5 whitespace-nowrap">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
          {seg.nav ? (
            <span className="flex items-center gap-1">
              {seg.nav.prevHref ? (
                <Link
                  href={seg.nav.prevHref}
                  aria-label="Previous diagram"
                  className="rounded p-0.5 transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Play className="h-3.5 w-3.5 rotate-180" fill="currentColor" />
                </Link>
              ) : (
                <Play className="h-3.5 w-3.5 rotate-180 opacity-30" fill="currentColor" />
              )}
              <span className="font-medium text-foreground">{seg.label}</span>
              {seg.nav.nextHref ? (
                <Link
                  href={seg.nav.nextHref}
                  aria-label="Next diagram"
                  className="rounded p-0.5 transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Play className="h-3.5 w-3.5" fill="currentColor" />
                </Link>
              ) : (
                <Play className="h-3.5 w-3.5 opacity-30" fill="currentColor" />
              )}
            </span>
          ) : seg.href ? (
            <Link href={seg.href} className="transition-colors hover:text-foreground">
              {seg.label}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{seg.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
