import { notFound } from 'next/navigation';
import { getCatalogInfo, getCatalogs, getLang } from '@/actions/yq';
import { VehicleWizard } from '@/components/vehicle-wizard';
import { Breadcrumb } from '@/components/catalog/breadcrumb';
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

  const brandLabel = decodeURIComponent(brand)
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <div className="px-4 py-4 sm:px-6">
      {wizardForm ? (
        <VehicleWizard
          initialForm={wizardForm}
          brand={brand}
          brandLabel={brandLabel}
          lang={lang}
        />
      ) : (
        <div className="space-y-6">
          <Breadcrumb segments={[{ label: t('start', lang), href: '/' }, { label: brandLabel }]} />
          <p className="text-muted-foreground">{t('noWizardAvailable', lang)}</p>
        </div>
      )}
    </div>
  );
}
