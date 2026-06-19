'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';
import { getCatalogInfo } from '@/actions/yq';
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
  const searchParams = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);

  // Some brands (e.g. "Opel" and "Opel (PSA)") share the same catalog.brand,
  // so the URL's brand slug alone can't tell them apart. catalogs[].token
  // is also useless here — the YQ API mints a fresh random token on every
  // catalogs() call, so it never matches the token already baked into the
  // URL. Resolving the real name requires asking the API directly for the
  // catalog this exact token points to.
  const urlToken = searchParams.get('token');
  const [resolved, setResolved] = useState<{ token: string | null; name: string | null }>({
    token: null,
    name: null,
  });

  useEffect(() => {
    if (!urlToken) return;
    let active = true;
    getCatalogInfo(urlToken).then((res) => {
      if (active) setResolved({ token: urlToken, name: res.data?.name ?? null });
    });
    return () => {
      active = false;
    };
  }, [urlToken]);

  const logoName = (resolved.token === urlToken && resolved.name) || brandLabel;

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
        <BrandLogo name={logoName} className="h-8 w-20" />
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
