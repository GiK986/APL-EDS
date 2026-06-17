'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { logoSlug } from '@/lib/logo-slug';
import { t, type Lang } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { VinSearchBox } from '@/components/catalog/vin-search-box';
import type { CatalogV2Dto } from '@/types/yq';

interface CatalogHeaderProps {
  brand: string;
  brandLabel: string;
  catalogs: CatalogV2Dto[];
  lang: Lang;
}

export function CatalogHeader({ brand, brandLabel, catalogs, lang }: CatalogHeaderProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  function handleSelectCatalog(catalog: CatalogV2Dto) {
    const infoToken = catalog.links[0]?.token ?? catalog.token;
    const slug = catalog.brand.toLowerCase().replace(/\s+/g, '-');
    setModalOpen(false);
    router.push(`/catalog/${encodeURIComponent(slug)}?token=${encodeURIComponent(infoToken)}`);
  }

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="flex items-center gap-2 font-semibold"
        title={t('brandSelection', lang)}
      >
        <BrandLogo name={brandLabel} className="h-8 w-20" />
      </button>

      <VinSearchBox brand={brand} lang={lang} />

      {modalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-6"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-background p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t('brandSelection', lang)}</h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {catalogs.map((catalog) => (
                <button
                  key={catalog.token}
                  type="button"
                  onClick={() => handleSelectCatalog(catalog)}
                  className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border p-3 transition-colors hover:border-primary/50 hover:bg-muted"
                >
                  <BrandLogo name={catalog.name} className="h-10 w-full" />
                  <span className="text-center text-xs font-medium text-muted-foreground">
                    {catalog.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function BrandLogo({ name, className }: { name: string; className?: string }) {
  const [broken, setBroken] = useState(false);
  const slug = logoSlug(name);

  if (broken) {
    return (
      <span className={cn('flex items-center justify-center text-sm font-semibold', className)}>
        {name}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/catalog-logos/${slug}.png`}
      alt={name}
      onError={() => setBroken(true)}
      className={cn('object-contain', className)}
    />
  );
}
