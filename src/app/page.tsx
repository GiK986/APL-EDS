import { getCatalogs, getLang } from '@/actions/yq';
import { BrandCard } from '@/components/brand-card';
import { VinSearchBox } from '@/components/catalog/vin-search-box';
import { t } from '@/lib/i18n';
import type { Lang } from '@/lib/i18n';

export default async function BrandGridPage() {
  const [catalogsRes, lang] = await Promise.all([getCatalogs(), getLang()]);
  const catalogs = catalogsRes.data?.catalogs ?? [];
  const activeCatalogs = catalogs.filter((c) => !c.archived);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col items-center text-center">
        <h2 className="text-sm font-medium text-muted-foreground">
          {t('vehicleIdentification', lang as Lang)}
        </h2>
        <VinSearchBox lang={lang as Lang} className="mt-2 w-full max-w-sm" />
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t('selectBrand', lang as Lang)}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {activeCatalogs.length} {t('allBrands', lang as Lang).toLowerCase()}
        </p>
      </div>

      {catalogs.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border">
          <p className="text-muted-foreground">
            {process.env.YQ_API_KEY
              ? t('noResults', lang as Lang)
              : t('missingApiKeyHint', lang as Lang)}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {activeCatalogs.map((catalog) => (
            <BrandCard key={catalog.token} catalog={catalog} />
          ))}
        </div>
      )}
    </div>
  );
}
