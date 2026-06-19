'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  findApplicableVehicles,
  findPartReferences,
  getVehicleInfo,
} from '@/actions/yq';
import { buildVehicleGroupsHref } from '@/lib/vehicle-nav';
import { t, type Lang } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { CatalogV2Dto, VehicleV2Dto } from '@/types/yq';

function brandSlug(brand: string): string {
  return brand.toLowerCase().replace(/\s+/g, '-');
}

interface PartSearchPanelProps {
  lang: Lang;
  onNavigate?: () => void;
  /** 'panel' renders inline (sidebar use). 'popover' renders an input that
   * opens a dropdown on focus, matching VinSearchBox (homepage use). */
  variant?: 'panel' | 'popover';
  /** Which edge the popover dropdown hangs from. Use 'right' when the
   * trigger sits near the right edge of the viewport (e.g. header). */
  align?: 'left' | 'right';
  className?: string;
}

export function PartSearchPanel({
  lang,
  onNavigate = () => {},
  variant = 'panel',
  align = 'left',
  className,
}: PartSearchPanelProps) {
  const isPopover = variant === 'popover';
  const router = useRouter();
  const params = useParams<{ brand: string }>();
  const searchParams = useSearchParams();
  const vehicleInfoToken = searchParams.get('vehicleInfoToken') ?? undefined;
  const vin = searchParams.get('vin') ?? undefined;
  const model = searchParams.get('model') ?? undefined;

  const [partNumber, setPartNumber] = useState('');
  const [includeReplacements, setIncludeReplacements] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [catalogChoices, setCatalogChoices] = useState<CatalogV2Dto[]>([]);
  const [vehicleChoices, setVehicleChoices] = useState<
    { vehicles: VehicleV2Dto[]; catalogBrand: string } | null
  >(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPopover) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPopover]);

  function goToVehicle(vehicle: VehicleV2Dto, catalogBrand: string) {
    const href = buildVehicleGroupsHref(brandSlug(catalogBrand), vehicle);
    if (!href) {
      setError(t('partNotFound', lang));
      return;
    }
    router.push(href);
    setOpen(false);
    onNavigate();
  }

  async function pickCatalog(catalog: CatalogV2Dto) {
    setCatalogChoices([]);
    setError(null);
    const favLink = catalog.links.find((l) => l.action === 'findApplicableVehicles');
    if (!favLink) {
      setError(t('partNotFound', lang));
      return;
    }
    setLoading(true);
    try {
      const res = await findApplicableVehicles(favLink.token, [
        { name: 'PartNumber', value: partNumber.trim() },
        { name: 'IncludeReplacements', value: String(includeReplacements) },
      ]);
      const vehicles = res.data?.vehicles ?? [];
      if (vehicles.length === 0) {
        setError(t('noVehiclesForPart', lang));
      } else if (vehicles.length === 1) {
        goToVehicle(vehicles[0], catalog.brand);
      } else {
        setVehicleChoices({ vehicles, catalogBrand: catalog.brand });
      }
    } catch {
      setError(t('partSearchFailed', lang));
    } finally {
      setLoading(false);
    }
  }

  async function runSearch() {
    const value = partNumber.trim();
    if (!value) return;
    setError(null);
    setCatalogChoices([]);
    setVehicleChoices(null);
    setLoading(true);

    if (vehicleInfoToken) {
      try {
        const viRes = await getVehicleInfo(vehicleInfoToken);
        const vehicle = viRes.data;
        if (viRes.error || !vehicle) {
          setError(t('vehicleInfoLoadFailed', lang));
          return;
        }
        const paForm = vehicle.forms?.find((f) => f.action === 'getPartApplicability');
        if (!paForm) {
          setError(t('partNotFound', lang));
          return;
        }
        const groupsLink = vehicle.navigationLinks.find((l) => l.code === 'GROUPS');
        const mainLink = vehicle.navigationLinks.find((l) => l.code === 'MAIN');

        const urlParams = new URLSearchParams({
          mode: 'applicability',
          partToken: paForm.token,
          partNumber: value,
          includeReplacements: String(includeReplacements),
        });
        if (groupsLink) urlParams.set('groupsToken', groupsLink.token);
        if (mainLink) urlParams.set('otherToken', mainLink.token);
        urlParams.set('vehicleInfoToken', vehicleInfoToken);
        if (vin) urlParams.set('vin', vin);
        if (model) urlParams.set('model', model);

        router.push(`/catalog/${params.brand}/groups/parts?${urlParams}`);
        setOpen(false);
        onNavigate();
      } catch {
        setError(t('partSearchFailed', lang));
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const refRes = await findPartReferences('', [{ name: 'PartNumber', value }]);
      const refs = refRes.data?.partReferences ?? [];
      const catalogs = refs.flatMap((r) => r.catalogs).filter((c) => !c.archived);
      if (catalogs.length === 0) {
        setError(t('partNotFound', lang));
      } else if (catalogs.length === 1) {
        setLoading(false);
        await pickCatalog(catalogs[0]);
        return;
      } else {
        setCatalogChoices(catalogs);
      }
    } catch {
      setError(t('partSearchFailed', lang));
    } finally {
      setLoading(false);
    }
  }

  const inputField = (
    <input
      type="text"
      value={partNumber}
      onChange={(e) => setPartNumber(e.target.value)}
      onFocus={() => isPopover && setOpen(true)}
      onKeyDown={(e) => e.key === 'Enter' && runSearch()}
      placeholder={t('partPlaceholder', lang)}
      className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
    />
  );

  const resultsAndControls = (
    <>
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={includeReplacements}
          onChange={(e) => setIncludeReplacements(e.target.checked)}
          className="h-4 w-4 rounded border-border"
        />
        {t('includeReplacements', lang)}
      </label>

      <button
        type="button"
        onClick={runSearch}
        disabled={loading || !partNumber.trim()}
        className="w-full rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {t('search', lang)}
      </button>

      {loading && (
        <p className="text-sm text-muted-foreground animate-pulse">{t('loading', lang)}</p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {catalogChoices.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t('selectCatalog', lang)}
          </p>
          <ul className="divide-y divide-border rounded-md border border-border">
            {catalogChoices.map((c) => (
              <li key={c.token}>
                <button
                  type="button"
                  onClick={() => pickCatalog(c)}
                  className="w-full px-2 py-1.5 text-left text-sm hover:bg-muted"
                >
                  {c.brand} — {c.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {vehicleChoices && vehicleChoices.vehicles.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t('selectVehicle', lang)}
          </p>
          <ul className="max-h-72 divide-y divide-border overflow-y-auto rounded-md border border-border">
            {vehicleChoices.vehicles.map((v, i) => (
              <li key={v.token ?? i}>
                <button
                  type="button"
                  onClick={() => goToVehicle(v, vehicleChoices.catalogBrand)}
                  className="w-full px-2 py-1.5 text-left text-sm hover:bg-muted"
                >
                  <div className="font-medium">
                    {v.brand} {v.model}
                  </div>
                  <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    {v.attributes.slice(0, 4).map((a) => (
                      <span key={a.code}>
                        {a.label}: {a.values.join(', ')}
                      </span>
                    ))}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );

  if (isPopover) {
    return (
      <div ref={containerRef} className={cn('relative w-72', className)}>
        {inputField}
        {open && (
          <div
            className={cn(
              'absolute top-full z-50 mt-1 w-80 space-y-3 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-lg',
              align === 'right' ? 'right-0' : 'left-0'
            )}
          >
            {resultsAndControls}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">{inputField}</div>
      {resultsAndControls}
    </div>
  );
}
