import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getCatalogInfo, getCatalogs, getLang } from '@/actions/yq';
import { VehicleWizard } from '@/components/vehicle-wizard';
import { t } from '@/lib/i18n';
import type { Lang } from '@/lib/i18n';
import type { FormV2Dto } from '@/types/yq';

interface PageProps {
  params: Promise<{ brand: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function CatalogPage({ params, searchParams }: PageProps) {
  const [{ brand }, { token }] = await Promise.all([params, searchParams]);
  const lang = (await getLang()) as Lang;

  if (!token) {
    // No token: fall back to finding the brand in the catalogs list
    const catalogsRes = await getCatalogs();
    const catalog = catalogsRes.data?.catalogs.find(
      (c) => c.brand.toLowerCase().replace(/\s+/g, '-') === decodeURIComponent(brand)
    );
    if (!catalog) return notFound();
    const infoToken = catalog.links[0]?.token ?? catalog.token;
    const infoRes = await getCatalogInfo(infoToken);
    return renderPage(brand, lang, infoRes.data?.forms ?? []);
  }

  const infoRes = await getCatalogInfo(token);
  if (infoRes.error) return notFound();

  return renderPage(brand, lang, infoRes.data?.forms ?? []);
}

function renderPage(brand: string, lang: Lang, forms: FormV2Dto[]) {
  const wizardForm = forms.find((f) => f.operationName === 'WIZARD');
  const vinForm = forms.find((f) => f.operationName === 'FINDVEHICLE_V2');
  const plateForm = forms.find(
    (f) => f.operationName === 'FINDVEHICLEBYPLATENUMBER_V2'
  );

  const brandLabel = decodeURIComponent(brand)
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          {t('allBrands', lang)}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">{brandLabel}</span>
      </nav>

      <h1 className="mb-6 text-2xl font-bold">{brandLabel}</h1>

      {wizardForm ? (
        <VehicleWizard
          initialForm={wizardForm}
          brand={brand}
          vinForm={vinForm}
          plateForm={plateForm}
        />
      ) : (
        <p className="text-muted-foreground">{t('noResults', lang)}</p>
      )}
    </div>
  );
}
