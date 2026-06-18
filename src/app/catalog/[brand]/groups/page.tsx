import { notFound } from 'next/navigation';
import { getGroups, getNavigationTree, getLang } from '@/actions/yq';
import { GroupsTree } from '@/components/groups-tree';
import { Breadcrumb } from '@/components/catalog/breadcrumb';
import { t } from '@/lib/i18n';
import type { Lang } from '@/lib/i18n';

interface PageProps {
  params: Promise<{ brand: string }>;
  searchParams: Promise<{
    token?: string;
    navToken?: string;
    view?: string;
    vin?: string;
    model?: string;
    vehicleInfoToken?: string;
  }>;
}

export default async function GroupsPage({ params, searchParams }: PageProps) {
  const [{ brand }, { token, navToken, view: viewParam, vin, model, vehicleInfoToken }] =
    await Promise.all([params, searchParams]);
  const lang = (await getLang()) as Lang;
  const view = viewParam === 'categories' ? 'categories' : 'groups';

  if (view === 'categories' ? !navToken : !token) return notFound();

  const treeRes =
    view === 'categories' ? await getNavigationTree(navToken!) : await getGroups(token!);
  if (treeRes.error || !treeRes.data) return notFound();

  const brandLabel = decodeURIComponent(brand)
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const basePath = `/catalog/${brand}`;
  const vehicleParams = new URLSearchParams();
  if (token) vehicleParams.set('token', token);
  if (navToken) vehicleParams.set('navToken', navToken);
  if (view === 'categories') vehicleParams.set('view', view);
  if (vin) vehicleParams.set('vin', vin);
  if (model) vehicleParams.set('model', model);
  if (vehicleInfoToken) vehicleParams.set('vehicleInfoToken', vehicleInfoToken);
  const vehicleHref = `${basePath}/groups?${vehicleParams}`;

  return (
    <div className="px-4 py-4 sm:px-6">
      <Breadcrumb
        segments={[
          { label: t('start', lang), href: '/' },
          {
            label: brandLabel,
            href: `/catalog/${brand}${navToken ? `?token=${encodeURIComponent(navToken)}` : ''}`,
          },
          ...(vin ? [{ label: vin, href: vehicleHref }] : []),
          { label: model || t('groups', lang) },
        ]}
      />

      <div className="mt-4">
        <GroupsTree
          key={view}
          tree={treeRes.data}
          brand={brand}
          basePath={basePath}
          view={view}
          groupsToken={token}
          categoriesToken={navToken}
          vin={vin}
          model={model}
          vehicleInfoToken={vehicleInfoToken}
          lang={lang}
        />
      </div>
    </div>
  );
}
