import fs from 'fs';
import path from 'path';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { CatalogV2Dto } from '@/types/yq';

interface BrandCardProps {
  catalog: CatalogV2Dto;
}

function logoSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function BrandCard({ catalog }: BrandCardProps) {
  // getCatalogInfo token is in catalog.links[0].token
  const infoToken = catalog.links[0]?.token ?? catalog.token;
  const brand = catalog.brand.toLowerCase().replace(/\s+/g, '-');
  const href = `/catalog/${encodeURIComponent(brand)}?token=${encodeURIComponent(infoToken)}`;

  const logoFile = `${logoSlug(catalog.name)}.png`;
  const hasLogo = fs.existsSync(
    path.join(process.cwd(), 'public', 'catalog-logos', logoFile)
  );

  return (
    <Link
      href={href}
      className={cn(
        'group flex flex-col items-center justify-center gap-2 rounded-xl border border-border',
        'bg-card p-6 text-card-foreground shadow-sm',
        'transition-all duration-200 hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5',
        catalog.archived && 'opacity-50 pointer-events-none'
      )}
    >
      <div className="relative h-16 w-full">
        {hasLogo ? (
          <Image
            src={`/catalog-logos/${logoFile}`}
            alt={catalog.name}
            fill
            sizes="160px"
            className="object-contain"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-center text-sm font-semibold tracking-wide text-foreground group-hover:text-primary transition-colors">
              {catalog.name}
            </span>
          </div>
        )}
      </div>
      {hasLogo && (
        <span className="text-center text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
          {catalog.name}
        </span>
      )}
    </Link>
  );
}
