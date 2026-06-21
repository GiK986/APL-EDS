import Link from 'next/link';
import { Search } from 'lucide-react';
import { getLang } from '@/actions/yq';
import { t } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/language-switcher';
import { PartSearchPanel } from '@/components/catalog/part-search-panel';
import type { Lang } from '@/lib/i18n';

export async function AppHeader() {
  const lang = (await getLang()) as Lang;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/Logo.svg" alt="" className="h-7 w-auto" />
          <span className="text-primary">{t('appTitle', lang)}</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 sm:flex">
            <Search className="h-4 w-4 text-muted-foreground" />
            <PartSearchPanel lang={lang} variant="popover" align="right" className="w-70" />
          </div>
          <LanguageSwitcher currentLang={lang} />
        </div>
      </div>
    </header>
  );
}
