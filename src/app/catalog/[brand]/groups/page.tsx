import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getGroups, getLang } from '@/actions/yq';
import { GroupsTree } from '@/components/groups-tree';
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
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          {t('allBrands', lang)}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/catalog/${brand}${navToken ? `?token=${encodeURIComponent(navToken)}` : ''}`}
          className="hover:text-foreground transition-colors"
        >
          {brandLabel}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">{t('groups', lang)}</span>
      </nav>

      <h1 className="mb-4 text-xl font-bold">{brandLabel} — {t('groups', lang)}</h1>

      <GroupsTree
        tree={groupsRes.data}
        brand={brand}
        basePath={basePath}
      />
    </div>
  );
}
