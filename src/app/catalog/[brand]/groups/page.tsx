import { notFound } from 'next/navigation';
import { getGroups, getLang } from '@/actions/yq';
import { GroupsTree } from '@/components/groups-tree';
import { Breadcrumb } from '@/components/catalog/breadcrumb';
import { t } from '@/lib/i18n';
import type { Lang } from '@/lib/i18n';

interface PageProps {
  params: Promise<{ brand: string }>;
  searchParams: Promise<{ token?: string; navToken?: string }>;
}

export default async function GroupsPage({ params, searchParams }: PageProps) {
  const [{ brand }, { token, navToken }] = await Promise.all([params, searchParams]);
  const lang = (await getLang()) as Lang;

  if (!token) return notFound();

  const groupsRes = await getGroups(token);
  if (groupsRes.error || !groupsRes.data) return notFound();

  const brandLabel = decodeURIComponent(brand)
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const basePath = `/catalog/${brand}`;

  return (
    <div className="px-4 py-4 sm:px-6">
      <Breadcrumb
        segments={[
          { label: t('start', lang), href: '/' },
          {
            label: brandLabel,
            href: `/catalog/${brand}${navToken ? `?token=${encodeURIComponent(navToken)}` : ''}`,
          },
          { label: t('groups', lang) },
        ]}
      />

      <div className="mt-4">
        <GroupsTree
          tree={groupsRes.data}
          brand={brand}
          basePath={basePath}
          groupsToken={token}
        />
      </div>
    </div>
  );
}
