import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getGroupParts, getLang } from '@/actions/yq';
import { PartsTable } from '@/components/parts-table';
import { t } from '@/lib/i18n';
import type { Lang } from '@/lib/i18n';

interface PageProps {
  params: Promise<{ brand: string }>;
  searchParams: Promise<{ token?: string; groupsToken?: string }>;
}

export default async function PartsPage({ params, searchParams }: PageProps) {
  const [{ brand }, { token, groupsToken }] = await Promise.all([params, searchParams]);
  const lang = (await getLang()) as Lang;

  if (!token) return notFound();

  const partsRes = await getGroupParts(token);
  if (partsRes.error || !partsRes.data) return notFound();

  const brandLabel = decodeURIComponent(brand)
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const groupsHref = `/catalog/${brand}/groups${groupsToken ? `?token=${encodeURIComponent(groupsToken)}` : ''}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          {t('allBrands', lang)}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/catalog/${brand}`}
          className="hover:text-foreground transition-colors"
        >
          {brandLabel}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={groupsHref} className="hover:text-foreground transition-colors">
          {t('groups', lang)}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">{t('parts', lang)}</span>
      </nav>

      <h1 className="mb-6 text-xl font-bold">{t('parts', lang)}</h1>

      <PartsTable categories={partsRes.data.categories} lang={lang} />
    </div>
  );
}
