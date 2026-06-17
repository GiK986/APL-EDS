import { notFound } from 'next/navigation';
import { getGroupParts, getLang } from '@/actions/yq';
import { PartsTable } from '@/components/parts-table';
import { Breadcrumb } from '@/components/catalog/breadcrumb';
import { t } from '@/lib/i18n';
import type { Lang } from '@/lib/i18n';

interface PageProps {
  params: Promise<{ brand: string }>;
  searchParams: Promise<{
    token?: string;
    groupsToken?: string;
    vin?: string;
    model?: string;
    group?: string;
    subgroup?: string;
  }>;
}

export default async function PartsPage({ params, searchParams }: PageProps) {
  const [{ brand }, { token, groupsToken, vin, model, group, subgroup }] = await Promise.all([
    params,
    searchParams,
  ]);
  const lang = (await getLang()) as Lang;

  if (!token) return notFound();

  const partsRes = await getGroupParts(token);
  if (partsRes.error || !partsRes.data) return notFound();

  const brandLabel = decodeURIComponent(brand)
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const groupsParams = new URLSearchParams();
  if (groupsToken) groupsParams.set('token', groupsToken);
  if (vin) groupsParams.set('vin', vin);
  if (model) groupsParams.set('model', model);
  const groupsHref = `/catalog/${brand}/groups${groupsParams.toString() ? `?${groupsParams}` : ''}`;

  return (
    <div className="px-4 py-4 sm:px-6">
      <Breadcrumb
        segments={[
          { label: t('start', lang), href: '/' },
          { label: brandLabel, href: `/catalog/${brand}` },
          ...(vin ? [{ label: vin, href: groupsHref }] : []),
          { label: model || t('groups', lang), href: groupsHref },
          ...(group ? [{ label: group, href: groupsHref }] : []),
          { label: subgroup || t('parts', lang) },
        ]}
      />

      <div className="mt-4">
        <PartsTable categories={partsRes.data.categories} lang={lang} />
      </div>
    </div>
  );
}
