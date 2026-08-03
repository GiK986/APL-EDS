import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { getCatalogs, getLang, searchVehicleByVinGlobal } from '@/actions/yq';
import { BrandCard } from '@/components/brand-card';
import { VinSearchBox } from '@/components/catalog/vin-search-box';
import { Tm1VinAutoRedirect } from '@/components/tm1-vin-auto-redirect';
import { buildVehicleGroupsHref } from '@/lib/vehicle-nav';
import { t } from '@/lib/i18n';
import type { Lang } from '@/lib/i18n';
import type { VehicleV2Dto } from '@/types/yq';

function brandSlug(brand: string): string {
  return brand.toLowerCase().replace(/\s+/g, '-');
}

// TM1 deep-links here with ?vin=... (its own TecDoc vehicle selection carries
// a VIN) to jump straight into the matching vehicle's catalog. A single
// match redirects immediately; more than one needs a pick step; zero falls
// back to a message with a way out, same as a manual VIN search would show.
async function VinDeepLink({ vin, lang }: { vin: string; lang: Lang }) {
  const res = await searchVehicleByVinGlobal(vin);
  const matches = (res.data?.vehicles ?? [])
    .map((vehicle) => ({
      vehicle,
      href: buildVehicleGroupsHref(brandSlug(vehicle.brand), vehicle, vin),
    }))
    .filter((m): m is { vehicle: VehicleV2Dto; href: string } => m.href !== null);

  if (matches.length === 1) {
    redirect(matches[0].href);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
        &larr; {t('start', lang)}
      </Link>

      {matches.length === 0 ? (
        <div className="mt-8 flex h-64 items-center justify-center rounded-xl border border-dashed border-border">
          <p className="text-muted-foreground">{t('noVehicleFoundDirect', lang)}</p>
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          <h1 className="text-sm font-semibold text-muted-foreground">
            {vin} &mdash; {matches.length} {t('vehicleFoundSuffix', lang)}
          </h1>
          <ul className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
            {matches.map(({ vehicle, href }, i) => (
              <li key={vehicle.token ?? i}>
                <Link
                  href={href}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted transition-colors group"
                >
                  <div>
                    <div className="text-sm font-medium">
                      {vehicle.brand} {vehicle.model}
                    </div>
                    <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      {(vehicle.attributes ?? []).slice(0, 4).map((a) => (
                        <span key={a.code}>
                          {a.label}: {a.values.join(', ')}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface PageProps {
  searchParams: Promise<{ vin?: string }>;
}

export default async function BrandGridPage({ searchParams }: PageProps) {
  const [{ vin }, lang] = await Promise.all([searchParams, getLang()]);

  if (vin) {
    return <VinDeepLink vin={vin} lang={lang as Lang} />;
  }

  const catalogsRes = await getCatalogs();
  const catalogs = catalogsRes.data?.catalogs ?? [];
  const activeCatalogs = catalogs.filter((c) => !c.archived);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Tm1VinAutoRedirect />
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
