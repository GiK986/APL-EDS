import { Car, Search } from 'lucide-react';
import { t, type Lang } from '@/lib/i18n';

interface CatalogSidebarProps {
  lang: Lang;
}

export function CatalogSidebar({ lang }: CatalogSidebarProps) {
  return (
    <aside className="flex w-12 shrink-0 flex-col items-center gap-1.5 border-r border-border bg-muted/30 py-2">
      <button
        type="button"
        title={t('vehicleIdentification', lang)}
        aria-current="true"
        className="flex h-10 w-10 items-center justify-center rounded-md bg-background text-foreground shadow-sm"
      >
        <Car className="h-5 w-5" />
      </button>
      <button
        type="button"
        title={t('searchPart', lang)}
        disabled
        className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-md text-muted-foreground/40"
      >
        <Search className="h-5 w-5" />
      </button>
    </aside>
  );
}
