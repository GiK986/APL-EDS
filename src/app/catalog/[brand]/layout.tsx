import { Suspense } from 'react';
import { getCatalogs, getLang } from '@/actions/yq';
import { CatalogHeader } from '@/components/catalog/catalog-header';
import { CatalogSidebar } from '@/components/catalog/catalog-sidebar';
import type { Lang } from '@/lib/i18n';

interface CatalogLayoutProps {
  children: React.ReactNode;
  params: Promise<{ brand: string }>;
}

export default async function CatalogLayout({ children, params }: CatalogLayoutProps) {
  const [{ brand }, catalogsRes, lang] = await Promise.all([params, getCatalogs(), getLang()]);
  const catalogs = catalogsRes.data?.catalogs.filter((c) => !c.archived) ?? [];

  const brandLabel = decodeURIComponent(brand)
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <div className="flex min-h-screen flex-col">
      <CatalogHeader
        brand={brand}
        brandLabel={brandLabel}
        catalogs={catalogs}
        lang={lang as Lang}
      />
      <div className="flex flex-1">
        <Suspense fallback={<div className="w-12 shrink-0 border-r border-border bg-muted/30" />}>
          <CatalogSidebar lang={lang as Lang} />
        </Suspense>
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
