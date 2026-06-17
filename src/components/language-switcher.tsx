'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { setLang } from '@/actions/yq';
import { cn } from '@/lib/utils';
import type { Lang } from '@/lib/i18n';

interface LanguageSwitcherProps {
  currentLang: Lang;
}

export function LanguageSwitcher({ currentLang }: LanguageSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(next: Lang) {
    startTransition(async () => {
      await setLang(next);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1 text-sm font-medium">
      <button
        onClick={() => handleChange('bg')}
        disabled={isPending}
        className={cn(
          'px-2 py-0.5 rounded transition-colors',
          currentLang === 'bg'
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-muted text-muted-foreground'
        )}
      >
        BG
      </button>
      <span className="text-muted-foreground">/</span>
      <button
        onClick={() => handleChange('en')}
        disabled={isPending}
        className={cn(
          'px-2 py-0.5 rounded transition-colors',
          currentLang === 'en'
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-muted text-muted-foreground'
        )}
      >
        EN
      </button>
    </div>
  );
}
