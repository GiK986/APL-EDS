import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { CatalogV2Dto } from '@/types/yq';

interface BrandCardProps {
  catalog: CatalogV2Dto;
}

export function BrandCard({ catalog }: BrandCardProps) {
  // getCatalogInfo token is in catalog.links[0].token
  const infoToken = catalog.links[0]?.token ?? catalog.token;
  const brand = catalog.brand.toLowerCase().replace(/\s+/g, '-');
  const href = `/catalog/${encodeURIComponent(brand)}?token=${encodeURIComponent(infoToken)}`;

  return (
    <Link
      href={href}
      className={cn(
        'group flex flex-col items-center justify-center rounded-xl border border-border',
        'bg-card p-6 text-card-foreground shadow-sm',
        'transition-all duration-200 hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5',
        catalog.archived && 'opacity-50 pointer-events-none'
      )}
    >
      <div className="flex h-16 w-full items-center justify-center">
        <span className="text-center text-sm font-semibold tracking-wide text-foreground group-hover:text-primary transition-colors">
          {catalog.name}
        </span>
      </div>
    </Link>
  );
}
