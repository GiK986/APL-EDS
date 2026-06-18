'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Layers, Minus, Plus, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getGroupPartsAll } from '@/actions/yq';
import type {
  CategoryV2Dto,
  PartSectionV2Dto,
  PartV2Dto,
  PartsByUnitV2Dto,
  UnitInfoV2Dto,
} from '@/types/yq';
import { t, type Lang } from '@/lib/i18n';

// Hotspot coordinates from getUnitInfo are expressed in the native pixel
// space of the %size%=source image itself, not a fixed virtual canvas —
// confirmed empirically (e.g. areas up to x=2216/y=2522 on a 2272x2572
// source image). They must be scaled against the loaded image's
// naturalWidth/naturalHeight, not a hardcoded constant.

const MIN_SPLIT = 25;
const MAX_SPLIT = 75;
const DEFAULT_SPLIT = 42;

interface PartsTableProps {
  categories: CategoryV2Dto[];
  unitInfoMap: Record<string, UnitInfoV2Dto>;
  allPartsToken?: string;
  lang: Lang;
  tall?: boolean;
}

export function PartsTable({ categories, unitInfoMap, allPartsToken, lang, tall }: PartsTableProps) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [expandedUnitData, setExpandedUnitData] = useState<PartsByUnitV2Dto | null>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  async function handleShowAll(key: string, unitCode?: string) {
    if (!allPartsToken) return;
    setLoadingKey(key);
    const res = await getGroupPartsAll(allPartsToken);
    setLoadingKey(null);
    if (res.error || !res.data) return;
    const allUnits = res.data.categories.flatMap((c) => c.units);
    const match = allUnits.find((u) => u.unit.code === unitCode) ?? allUnits[0];
    if (match) {
      setExpandedUnitData(match);
      setExpandedKey(key);
    }
  }

  if (categories.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border">
        <p className="text-sm text-muted-foreground">{t('noResults', lang)}</p>
      </div>
    );
  }

  if (expandedKey && expandedUnitData) {
    const noteAttr = unitInfoMap[expandedKey]?.attributes?.find((a) => a.code === 'note');
    return (
      <div className="flex h-[80vh] flex-col">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium">{expandedUnitData.unit.name}</h3>
            {expandedUnitData.unit.code && (
              <p className="text-xs text-muted-foreground">
                {t('unitLabel', lang)}: {expandedUnitData.unit.code}
              </p>
            )}
            {noteAttr && (
              <p className="mt-0.5 text-xs italic text-muted-foreground">
                {noteAttr.label}: {noteAttr.values.join(', ')}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setExpandedKey(null);
              setExpandedUnitData(null);
            }}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('back', lang)}
          </button>
        </div>
        <UnitPanel unitData={expandedUnitData} unitInfo={unitInfoMap[expandedKey]} lang={lang} fullHeight />
      </div>
    );
  }

  return (
    <div className={cn(tall ? 'flex h-[80vh] flex-col gap-8' : 'space-y-8')}>
      {categories.map((cat, ci) => (
        <div
          key={cat.category.token ?? ci}
          className={cn('space-y-4', tall && 'flex min-h-0 flex-1 flex-col')}
        >
          <h2 className="text-base font-semibold">
            {cat.category.name}
            {cat.category.code && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                #{cat.category.code}
              </span>
            )}
          </h2>

          {cat.units.map((unitData, ui) => {
            const key = `${ci}-${ui}`;
            return (
              <UnitPanel
                key={unitData.unit.code ?? ui}
                unitData={unitData}
                unitInfo={unitInfoMap[key]}
                lang={lang}
                canShowAll={!!allPartsToken}
                isLoadingAll={loadingKey === key}
                onShowAll={() => handleShowAll(key, unitData.unit.code)}
                tall={tall}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

interface UnitPanelProps {
  unitData: PartsByUnitV2Dto;
  unitInfo?: UnitInfoV2Dto;
  lang: Lang;
  fullHeight?: boolean;
  tall?: boolean;
  canShowAll?: boolean;
  isLoadingAll?: boolean;
  onShowAll?: () => void;
}

function UnitPanel({
  unitData,
  unitInfo,
  lang,
  fullHeight,
  tall,
  canShowAll,
  isLoadingAll,
  onShowAll,
}: UnitPanelProps) {
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [splitPct, setSplitPct] = useState(DEFAULT_SPLIT);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [paneSize, setPaneSize] = useState({ w: 0, h: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const panDragRef = useRef<{
    startX: number;
    startY: number;
    startPanX: number;
    startPanY: number;
    moved: boolean;
  } | null>(null);

  const imageMap = unitInfo?.imageMaps?.[0];
  const imageName = imageMap?.imageName ?? unitData.imageNames?.[0];
  const imageSrc = imageName?.replace('%size%', 'source');
  const noteAttr = unitInfo?.attributes?.find((a) => a.code === 'note');

  const baseScale =
    natural && paneSize.w && paneSize.h
      ? Math.min(paneSize.w / natural.w, paneSize.h / natural.h)
      : 0;
  const renderedW = natural ? natural.w * baseScale * zoom : 0;
  const renderedH = natural ? natural.h * baseScale * zoom : 0;

  useEffect(() => {
    const el = paneRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setPaneSize({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function zoomBy(delta: number) {
    setZoom((z) => {
      const next = Math.min(3, Math.max(1, z + delta));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  }

  function resetZoom() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  function handleImagePointerMove(e: PointerEvent) {
    const drag = panDragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) drag.moved = true;
    const maxPanX = Math.max(0, (renderedW - paneSize.w) / 2);
    const maxPanY = Math.max(0, (renderedH - paneSize.h) / 2);
    setPan({
      x: Math.min(maxPanX, Math.max(-maxPanX, drag.startPanX + dx)),
      y: Math.min(maxPanY, Math.max(-maxPanY, drag.startPanY + dy)),
    });
  }

  function handleImagePointerUp() {
    window.removeEventListener('pointermove', handleImagePointerMove);
    window.removeEventListener('pointerup', handleImagePointerUp);
  }

  function handleImagePointerDown(e: React.PointerEvent) {
    if (zoom <= 1) return;
    e.preventDefault();
    panDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPanX: pan.x,
      startPanY: pan.y,
      moved: false,
    };
    window.addEventListener('pointermove', handleImagePointerMove);
    window.addEventListener('pointerup', handleImagePointerUp);
  }

  function handleWrapperClickCapture(e: React.MouseEvent) {
    if (panDragRef.current?.moved) {
      e.stopPropagation();
    }
    panDragRef.current = null;
  }

  function captureNatural(el: HTMLImageElement | null) {
    if (!el?.complete || !el.naturalWidth) return;
    setNatural((prev) =>
      prev && prev.w === el.naturalWidth && prev.h === el.naturalHeight
        ? prev
        : { w: el.naturalWidth, h: el.naturalHeight }
    );
  }

  function handlePointerMove(e: PointerEvent) {
    if (!draggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setSplitPct(Math.min(MAX_SPLIT, Math.max(MIN_SPLIT, pct)));
  }

  function handlePointerUp() {
    draggingRef.current = false;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  }

  function handleDividerDown(e: React.PointerEvent) {
    e.preventDefault();
    draggingRef.current = true;
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }

  function toggleAreaCode(code?: string) {
    if (!code) return;
    setSelectedCode((prev) => (prev === code ? null : code));
  }

  return (
    <div className={cn('flex flex-col gap-3', (fullHeight || tall) && 'flex-1 min-h-0')}>
      {!fullHeight && (
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium">{unitData.unit.name}</h3>
            {unitData.unit.code && (
              <p className="text-xs text-muted-foreground">
                {t('unitLabel', lang)}: {unitData.unit.code}
              </p>
            )}
            {noteAttr && (
              <p className="mt-0.5 text-xs italic text-muted-foreground">
                {noteAttr.label}: {noteAttr.values.join(', ')}
              </p>
            )}
          </div>
          {canShowAll && onShowAll && (
            <button
              type="button"
              onClick={onShowAll}
              disabled={isLoadingAll}
              className="flex shrink-0 items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted disabled:opacity-50"
            >
              <Layers className="h-3.5 w-3.5" />
              {isLoadingAll ? t('loadingAllParts', lang) : t('showAllParts', lang)}
            </button>
          )}
        </div>
      )}

      <div
        ref={containerRef}
        className={cn(
          'flex overflow-hidden rounded-xl border border-border',
          fullHeight || tall ? 'min-h-0 flex-1' : 'h-[480px]'
        )}
      >
        {/* Diagram pane */}
        <div
          className="relative flex shrink-0 flex-col bg-muted/20"
          style={{ width: `${splitPct}%` }}
        >
          <div ref={paneRef} className="relative flex-1 overflow-hidden">
            {imageSrc ? (
              <div
                className="absolute left-1/2 top-1/2"
                style={{
                  width: renderedW || undefined,
                  height: renderedH || undefined,
                  transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px)`,
                  cursor: zoom > 1 ? 'grab' : 'default',
                }}
                onPointerDown={handleImagePointerDown}
                onClickCapture={handleWrapperClickCapture}
              >
                {/* next/image would resize this server-side, so naturalWidth/naturalHeight
                    would no longer match the source-pixel space the hotspot area coordinates
                    (area.x1/y1/x2/y2) are defined in, breaking overlay alignment. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={captureNatural}
                  src={imageSrc}
                  alt={unitData.unit.name}
                  className="absolute inset-0 h-full w-full object-fill"
                  draggable={false}
                  onLoad={(e) => captureNatural(e.currentTarget)}
                />
                {natural &&
                  imageMap?.areas.map((area, areaIndex) => {
                    const isActive =
                      area.areaCode === hoveredCode || area.areaCode === selectedCode;
                    return (
                      <button
                        key={`${area.areaCode}-${areaIndex}`}
                        type="button"
                        onMouseEnter={() => setHoveredCode(area.areaCode)}
                        onMouseLeave={() => setHoveredCode(null)}
                        onClick={() => toggleAreaCode(area.areaCode)}
                        className={cn(
                          'absolute border-2 transition-colors',
                          isActive
                            ? 'border-primary bg-primary/25'
                            : 'border-transparent hover:border-primary/60 hover:bg-primary/10'
                        )}
                        style={{
                          left: `${(area.x1 / natural.w) * 100}%`,
                          top: `${(area.y1 / natural.h) * 100}%`,
                          width: `${((area.x2 - area.x1) / natural.w) * 100}%`,
                          height: `${((area.y2 - area.y1) / natural.h) * 100}%`,
                        }}
                        aria-label={area.areaCode}
                      />
                    );
                  })}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">{t('noDiagram', lang)}</p>
              </div>
            )}
          </div>

          {imageSrc && (
            <div className="flex items-center gap-1 border-t border-border bg-background/80 px-2 py-1">
              <button
                type="button"
                onClick={() => zoomBy(-0.25)}
                aria-label={t('zoomOut', lang)}
                className="rounded-md p-1 hover:bg-muted"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-10 text-center text-xs text-muted-foreground">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => zoomBy(0.25)}
                aria-label={t('zoomIn', lang)}
                className="rounded-md p-1 hover:bg-muted"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={resetZoom}
                aria-label={t('resetZoom', lang)}
                className="rounded-md p-1 hover:bg-muted"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Resize divider */}
        <div
          onPointerDown={handleDividerDown}
          className="group flex w-2.5 shrink-0 cursor-col-resize items-center justify-center border-x border-border bg-muted/40 hover:bg-muted"
        >
          <div className="h-8 w-1 rounded-full bg-border group-hover:bg-foreground/40" />
        </div>

        {/* Table pane */}
        <div className="min-w-0 flex-1 overflow-auto">
          {unitData.partSections.map((section, si) => (
            <PartsSectionTable
              key={si}
              section={section}
              hoveredCode={hoveredCode}
              selectedCode={selectedCode}
              onHover={setHoveredCode}
              onClick={toggleAreaCode}
              lang={lang}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface AttrColumn {
  code: string;
  label: string;
}

// Columns are not fixed: each brand exposes a different set of part
// attributes (e.g. VW: Quantity/Note, Opel: gm_part_number/Range), so the
// column set is derived per-section from whatever labels are actually
// present, instead of being hardcoded per brand.
function computeAttrColumns(parts: PartV2Dto[]): AttrColumn[] {
  const columns = new Map<string, string>();
  for (const part of parts) {
    for (const attr of part.attributes ?? []) {
      if (attr.code === 'GROUP' || attr.code === 'YEAR_RANGE') continue;
      if (!columns.has(attr.code)) columns.set(attr.code, attr.label);
    }
  }
  return Array.from(columns, ([code, label]) => ({ code, label }));
}

function partHasQty(parts: PartV2Dto[]): boolean {
  return parts.some((p) => p.qty?.note != null || p.qty?.qty != null);
}

// "Note" values encode multiple sub-fields joined with ';' (e.g.
// "door;left" or "rear view mirror housing;left;PR:6XN+7Y8+"), so each
// segment renders on its own line. Other attributes (e.g. BMW's
// associated_parts) use ';' as ordinary punctuation inside prose, so only
// Note is split this way.
function attrCellLines(part: PartV2Dto, code: string): string[] {
  const matches = part.attributes?.filter((a) => a.code === code) ?? [];
  return matches.flatMap((attr) =>
    attr.values.flatMap((v) =>
      code === 'note'
        ? v
            .split(';')
            .map((s) => s.trim())
            .filter(Boolean)
        : [v]
    )
  );
}

interface PartsSectionTableProps {
  section: PartSectionV2Dto;
  hoveredCode: string | null;
  selectedCode: string | null;
  onHover: (code: string | null) => void;
  onClick: (code?: string) => void;
  lang: Lang;
}

function PartsSectionTable({
  section,
  hoveredCode,
  selectedCode,
  onHover,
  onClick,
  lang,
}: PartsSectionTableProps) {
  const columns = useMemo(() => computeAttrColumns(section.parts), [section.parts]);
  const showQty = useMemo(() => partHasQty(section.parts), [section.parts]);

  return (
    <div>
      {section.title && (
        <p className="px-3 pt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {section.title}
        </p>
      )}
      <table className="w-full text-sm">
        <thead className="sticky top-0 border-b border-border bg-muted/50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground w-10">
              {t('position', lang)}
            </th>
            <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground">
              {t('partNumber', lang)}
            </th>
            <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground">
              {t('partName', lang)}
            </th>
            {showQty && (
              <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground w-16">
                {t('qty', lang)}
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.code}
                className="px-3 py-2 text-left font-medium text-xs text-muted-foreground hidden lg:table-cell"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {section.parts.map((part, pi) => (
            <PartRow
              key={part.partNumber + pi}
              part={part}
              isActive={!!part.areaCode && (part.areaCode === hoveredCode || part.areaCode === selectedCode)}
              onHover={onHover}
              onClick={() => onClick(part.areaCode)}
              columns={columns}
              showQty={showQty}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface PartRowProps {
  part: PartV2Dto;
  isActive: boolean;
  onHover: (code: string | null) => void;
  onClick: () => void;
  columns: AttrColumn[];
  showQty: boolean;
}

function PartRow({ part, isActive, onHover, onClick, columns, showQty }: PartRowProps) {
  return (
    <tr
      onMouseEnter={() => part.areaCode && onHover(part.areaCode)}
      onMouseLeave={() => onHover(null)}
      onClick={onClick}
      className={cn(
        'cursor-pointer transition-colors hover:bg-muted/40',
        part.matched && 'bg-primary/5',
        isActive && 'bg-primary/15'
      )}
    >
      <td className="px-3 py-2 text-center text-xs text-muted-foreground">{part.areaCode}</td>
      <td className="px-3 py-2 font-mono text-xs font-medium">
        {part.partNumberFormatted ?? part.partNumber}
      </td>
      <td className="px-3 py-2">
        <div className="font-medium">{part.displayName || part.partName}</div>
        {part.displayName && part.partName !== part.displayName && (
          <div className="text-xs text-muted-foreground">{part.partName}</div>
        )}
      </td>
      {showQty && (
        <td className="px-3 py-2 text-center text-xs">{part.qty?.note ?? part.qty?.qty ?? '—'}</td>
      )}
      {columns.map((col) => {
        const lines = attrCellLines(part, col.code);
        return (
          <td
            key={col.code}
            className="px-3 py-2 text-xs text-muted-foreground hidden lg:table-cell"
          >
            {lines.length ? lines.map((line, i) => <div key={i}>{line}</div>) : '—'}
          </td>
        );
      })}
    </tr>
  );
}
