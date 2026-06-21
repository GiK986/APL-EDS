'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Camera } from 'lucide-react';
import { searchVehicleByVin, searchVehicleByVinGlobal } from '@/actions/yq';
import { buildVehicleGroupsHref } from '@/lib/vehicle-nav';
import { ScanVinModal } from '@/components/catalog/scan-vin-modal';
import { t, type Lang } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { VehicleV2Dto } from '@/types/yq';

const RECENT_KEY = 'apl-eds:recent-vehicles';
// Storage itself is unbounded — kept so the brand-filtered view below has a
// full history to filter from, not just whatever survived the global cap.
// Only the rendered dropdown is capped (and scrollable).
const RECENT_DISPLAY_LIMIT = 15;

const ENGINE_ATTR_CODES = ['engine', 'enginecode', 'motor', 'motorcode'];
const BODY_ATTR_CODES = ['bodystyle', 'bodytype', 'body', 'karosserie'];

interface RecentVehicle {
  vin: string;
  brand: string;
  model: string;
  searchedAt?: number;
}

function findAttr(vehicle: VehicleV2Dto, codes: string[]) {
  return vehicle.attributes.find((a) => codes.includes(a.code.toLowerCase()));
}

function brandSlug(brand: string): string {
  return brand.toLowerCase().replace(/\s+/g, '-');
}

function formatRelativeTime(timestamp: number, lang: Lang): string {
  const diffSeconds = Math.round((timestamp - Date.now()) / 1000);
  const divisions: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, 'seconds'],
    [60, 'minutes'],
    [24, 'hours'],
    [7, 'days'],
    [4.34524, 'weeks'],
    [12, 'months'],
    [Infinity, 'years'],
  ];
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
  let duration = diffSeconds;
  for (const [amount, unit] of divisions) {
    if (Math.abs(duration) < amount) return rtf.format(Math.round(duration), unit);
    duration /= amount;
  }
  return rtf.format(Math.round(duration), 'years');
}

interface VinSearchBoxProps {
  /** Brand slug. When set, search is scoped to that brand's catalog and the
   * "recent vehicles" list is filtered to that brand. When omitted, search
   * runs across all catalogs and the recent list shows every brand. */
  brand?: string;
  lang: Lang;
  className?: string;
}

export function VinSearchBox({ brand, lang, className }: VinSearchBoxProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [directOpen, setDirectOpen] = useState(false);
  const [directValue, setDirectValue] = useState('');
  const [directError, setDirectError] = useState<string | null>(null);
  const [directVehicles, setDirectVehicles] = useState<VehicleV2Dto[]>([]);
  const [scanOpen, setScanOpen] = useState(false);
  const [recent, setRecent] = useState<RecentVehicle[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDirectOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function saveRecent(vehicle: VehicleV2Dto, vin: string, searchedAt: number) {
    const entry = {
      vin,
      brand: vehicle.brand,
      model: vehicle.model,
      searchedAt,
    };
    const next = [entry, ...recent.filter((r) => r.vin !== vin)];
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      // ignore storage write failures
    }
  }

  function goToVehicle(vehicle: VehicleV2Dto, vin: string) {
    const targetBrand = brand ?? brandSlug(vehicle.brand);
    const href = buildVehicleGroupsHref(targetBrand, vehicle, vin);
    if (href) {
      setDirectOpen(false);
      router.push(href);
    }
  }

  function runSearch(vin: string) {
    const value = vin.trim();
    if (!value) return;
    setDirectError(null);
    setDirectVehicles([]);
    startTransition(async () => {
      try {
        const res = brand
          ? await searchVehicleByVin(brand, value)
          : await searchVehicleByVinGlobal(value);
        const vehicles = res?.data?.vehicles ?? [];
        if (vehicles.length === 0) {
          setDirectError(t('noVehicleFoundDirect', lang));
        } else if (vehicles.length === 1) {
          saveRecent(vehicles[0], value, Date.now());
          goToVehicle(vehicles[0], value);
        } else {
          setDirectVehicles(vehicles);
          inputRef.current?.focus();
        }
      } catch {
        setDirectError(t('directSearchFailed', lang));
      }
    });
  }

  function handleSelectVehicle(vehicle: VehicleV2Dto, searchedAt: number) {
    const vin = directValue.trim();
    saveRecent(vehicle, vin, searchedAt);
    goToVehicle(vehicle, vin);
  }

  const filteredRecent = recent
    .filter((r) => !brand || brandSlug(r.brand) === brand)
    .filter(
      (r) =>
        !directValue.trim() || r.vin.toLowerCase().includes(directValue.trim().toLowerCase())
    );

  return (
    <div ref={containerRef} className={cn('relative w-72', className)}>
      <input
        ref={inputRef}
        type="text"
        value={directValue}
        onChange={(e) => setDirectValue(e.target.value)}
        onFocus={() => setDirectOpen(true)}
        onKeyDown={(e) => e.key === 'Enter' && runSearch(directValue)}
        placeholder={t('directEntryPlaceholder', lang)}
        className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
      />

      {directOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-lg">
          <button
            type="button"
            onClick={() => setScanOpen(true)}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
          >
            <Camera className="h-4 w-4 text-muted-foreground" />
            {t('scanVinFromPhoto', lang)}
          </button>

          {directError && <p className="mt-2 px-2 text-xs text-destructive">{directError}</p>}

          {directVehicles.length > 0 && (
            <ul className="mt-2 max-h-56 divide-y divide-border overflow-y-auto rounded-md border border-border">
              {directVehicles.map((v, i) => {
                const engine = findAttr(v, ENGINE_ATTR_CODES);
                const body = findAttr(v, BODY_ATTR_CODES);
                const otherAttrs = v.attributes
                  .filter((a) => a !== engine && a !== body)
                  .slice(0, 4);
                return (
                  <li key={v.token ?? i}>
                    <button
                      type="button"
                      onClick={() => handleSelectVehicle(v, Date.now())}
                      className="w-full px-2 py-1.5 text-left text-sm hover:bg-muted"
                    >
                      <div className="font-medium">
                        {v.brand} {v.model}
                      </div>
                      {(engine || body) && (
                        <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs font-medium text-foreground/80">
                          {engine && (
                            <span>
                              {engine.label}: {engine.values.join(', ')}
                            </span>
                          )}
                          {body && (
                            <span>
                              {body.label}: {body.values.join(', ')}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        {otherAttrs.map((a) => (
                          <span key={a.code}>
                            {a.label}: {a.values.join(', ')}
                          </span>
                        ))}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {filteredRecent.length > 0 && (
            <div className="mt-2">
              <p className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t('lastVehiclesSelected', lang)}
              </p>
              <ul className="mt-1 max-h-64 overflow-y-auto">
                {filteredRecent.slice(0, RECENT_DISPLAY_LIMIT).map((r) => (
                  <li key={r.vin}>
                    <button
                      type="button"
                      onClick={() => {
                        setDirectValue(r.vin);
                        runSearch(r.vin);
                      }}
                      className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                    >
                      <span className="flex flex-col">
                        <span className="font-mono">{r.vin}</span>
                        <span className="text-xs text-muted-foreground">
                          {r.brand} {r.model}
                        </span>
                      </span>
                      {r.searchedAt && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatRelativeTime(r.searchedAt, lang)}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {isPending && (
            <p className="mt-2 px-2 text-xs text-muted-foreground animate-pulse">
              {t('loading', lang)}
            </p>
          )}
        </div>
      )}

      <ScanVinModal
        open={scanOpen}
        onOpenChange={setScanOpen}
        lang={lang}
        onConfirm={(scannedVin) => {
          setDirectValue(scannedVin);
          runSearch(scannedVin);
        }}
      />
    </div>
  );
}
