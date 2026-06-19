'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Car, Search, X } from 'lucide-react';
import { getVehicleInfo } from '@/actions/yq';
import { PartSearchPanel } from '@/components/catalog/part-search-panel';
import { t, type Lang } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { VehicleV2Dto } from '@/types/yq';

interface CatalogSidebarProps {
  lang: Lang;
}

type PanelMode = 'vehicle' | 'search' | null;

export function CatalogSidebar({ lang }: CatalogSidebarProps) {
  const searchParams = useSearchParams();
  const vehicleInfoToken = searchParams.get('vehicleInfoToken') ?? undefined;
  const vin = searchParams.get('vin') ?? undefined;

  const [panelMode, setPanelMode] = useState<PanelMode>(null);
  const open = panelMode !== null;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicle, setVehicle] = useState<VehicleV2Dto | null>(null);
  const [loadedToken, setLoadedToken] = useState<string | null>(null);

  useEffect(() => {
    if (!vehicleInfoToken || loadedToken === vehicleInfoToken) return;
    setLoading(true);
    setError(null);
    getVehicleInfo(vehicleInfoToken)
      .then((res) => {
        if (res.error || !res.data) {
          setError(t('vehicleInfoLoadFailed', lang));
          return;
        }
        setVehicle(res.data);
        setLoadedToken(vehicleInfoToken);
      })
      .catch(() => setError(t('vehicleInfoLoadFailed', lang)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleInfoToken]);

  function toggleMode(mode: PanelMode) {
    setPanelMode((prev) => (prev === mode ? null : mode));
  }

  const filterLevel = vehicle?.sysProperties.find((p) => p.code === 'filter_level')?.value;
  const filterLevelFull = filterLevel === 'full';

  return (
    <div className="flex shrink-0">
      <aside className="flex w-12 shrink-0 flex-col items-center gap-1.5 border-r border-border bg-muted/30 py-2">
        <button
          type="button"
          title={t('vehicleIdentification', lang)}
          aria-current={panelMode === 'vehicle'}
          onClick={() => toggleMode('vehicle')}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-md shadow-sm transition-colors',
            filterLevel
              ? filterLevelFull
                ? 'bg-green-600/15 text-green-700'
                : 'bg-amber-500/15 text-amber-700'
              : 'bg-background text-foreground',
            panelMode === 'vehicle' && 'ring-2 ring-primary/40'
          )}
        >
          <Car className="h-5 w-5" />
        </button>
        <button
          type="button"
          title={t('searchPart', lang)}
          aria-current={panelMode === 'search'}
          onClick={() => toggleMode('search')}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-md text-foreground shadow-sm transition-colors',
            panelMode === 'search' && 'ring-2 ring-primary/40'
          )}
        >
          <Search className="h-5 w-5" />
        </button>
      </aside>

      {open && (
        <div className="w-72 shrink-0 overflow-y-auto border-r border-border bg-background p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              {panelMode === 'search' ? t('searchPart', lang) : t('vehicleDetails', lang)}
            </h2>
            <button
              type="button"
              title={t('close', lang)}
              onClick={() => setPanelMode(null)}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {panelMode === 'search' && (
            <PartSearchPanel lang={lang} onNavigate={() => setPanelMode(null)} />
          )}

          {panelMode === 'vehicle' && (
            <>
              {!vehicleInfoToken && (
                <p className="text-sm text-muted-foreground">
                  {t('vehicleInfoUnavailable', lang)}
                </p>
              )}
              {loading && (
                <p className="text-sm text-muted-foreground animate-pulse">
                  {t('loading', lang)}
                </p>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}

              {vehicle && !loading && !error && (
                <div className="space-y-3">
                  <div>
                    <div className="text-base font-semibold">
                      {vehicle.brand} {vehicle.model}
                    </div>
                    {vin && <div className="font-mono text-xs text-muted-foreground">{vin}</div>}
                  </div>

                  {filterLevel && (
                    <div
                      className={cn(
                        'rounded-md border px-2.5 py-2 text-xs',
                        filterLevelFull
                          ? 'border-green-600/30 bg-green-600/10 text-green-700'
                          : 'border-amber-500/30 bg-amber-500/10 text-amber-700'
                      )}
                    >
                      <div className="font-semibold">
                        {t('filterLevel', lang)}: {filterLevel}
                      </div>
                      <div className="mt-0.5">
                        {filterLevelFull
                          ? t('filterLevelFull', lang)
                          : t('filterLevelPartial', lang)}
                      </div>
                    </div>
                  )}

                  <dl className="space-y-1.5 text-sm">
                    {vehicle.attributes.map((a) => (
                      <div key={a.code} className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">{a.label}</dt>
                        <dd className="text-right font-medium">{a.values.join(', ')}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
