'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Search, X } from 'lucide-react';
import { cleanText, cn } from '@/lib/utils';
import { attrCellLines, computeAttrColumns } from '@/lib/attr-columns';
import { highlightCodes } from '@/components/highlight-codes';
import { t, type Lang } from '@/lib/i18n';
import { getUnits } from '@/actions/yq';
import { Breadcrumb, type BreadcrumbSegment } from '@/components/catalog/breadcrumb';
import type { GroupNodeV2Dto, UnitShortV2Dto } from '@/types/yq';

type TreeView = 'groups' | 'categories';

// The full groups/categories tree arrives in one API call already fully
// nested, so name search is a pure client-side filter — no extra requests.
// A node that matches by name keeps its whole subtree intact (browsing
// the match); a node that doesn't match keeps only descendants that do.
function filterTreeNode(node: GroupNodeV2Dto, query: string): GroupNodeV2Dto | null {
  if (node.name.toLowerCase().includes(query)) return node;
  if (!node.children?.length) return null;
  const keptChildren = node.children
    .map((child) => filterTreeNode(child, query))
    .filter((child): child is GroupNodeV2Dto => child !== null);
  if (keptChildren.length === 0) return null;
  return { ...node, children: keptChildren };
}

interface GroupsTreeProps {
  tree: GroupNodeV2Dto;
  brand: string;
  basePath: string;
  view: TreeView;
  groupsToken?: string;
  categoriesToken?: string;
  vin?: string;
  model?: string;
  vehicleInfoToken?: string;
  initialGroup?: string;
  breadcrumbSegments: BreadcrumbSegment[];
  lang: Lang;
  matchCodes?: string[];
}

function buildViewHref(
  basePath: string,
  targetView: TreeView,
  groupsToken: string | undefined,
  categoriesToken: string | undefined,
  vin: string | undefined,
  model: string | undefined,
  vehicleInfoToken: string | undefined
): string | undefined {
  const token = targetView === 'categories' ? categoriesToken : groupsToken;
  if (!token) return undefined;
  const params = new URLSearchParams();
  if (targetView === 'categories') {
    params.set('navToken', token);
    params.set('view', 'categories');
    if (groupsToken) params.set('token', groupsToken);
  } else {
    params.set('token', token);
    if (categoriesToken) params.set('navToken', categoriesToken);
  }
  if (vin) params.set('vin', vin);
  if (model) params.set('model', model);
  if (vehicleInfoToken) params.set('vehicleInfoToken', vehicleInfoToken);
  return `${basePath}/groups?${params}`;
}

export function GroupsTree({
  tree,
  brand,
  basePath,
  view,
  groupsToken,
  categoriesToken,
  vin,
  model,
  vehicleInfoToken,
  initialGroup,
  breadcrumbSegments,
  lang,
  matchCodes,
}: GroupsTreeProps) {
  const [query, setQuery] = useState('');
  const searchInputId = useId();
  const [selectedKey, setSelectedKey] = useState<string | null>(
    () => initialGroup ?? tree.children?.[0]?.name ?? null
  );

  const normalizedQuery = query.trim().toLowerCase();

  // In "categories" the search is scoped to the selected group's own
  // content (see below) — the left-hand group list always stays whole so
  // switching the search term never makes a group disappear from under you.
  const topGroups = useMemo(() => {
    const allTopGroups = tree.children ?? [];
    if (view === 'categories' || !normalizedQuery) return allTopGroups;
    return allTopGroups
      .map((group) => filterTreeNode(group, normalizedQuery))
      .filter((group): group is GroupNodeV2Dto => group !== null);
  }, [tree.children, normalizedQuery, view]);

  const selected = topGroups.find((g) => g.name === selectedKey) ?? topGroups[0] ?? null;
  const subGroups = useMemo(() => selected?.children ?? [], [selected]);

  // Categories-only: filter the selected group's own subtree by name,
  // leaving `subGroups` (used for the structural "has children?" checks
  // below) untouched.
  const visibleSubGroups = useMemo(() => {
    if (view !== 'categories' || !normalizedQuery) return subGroups;
    return subGroups
      .map((group) => filterTreeNode(group, normalizedQuery))
      .filter((group): group is GroupNodeV2Dto => group !== null);
  }, [subGroups, normalizedQuery, view]);
  const categoriesSearchQuery = view === 'categories' ? normalizedQuery : undefined;

  const activeToken = view === 'categories' ? categoriesToken : groupsToken;
  const otherToken = view === 'categories' ? groupsToken : categoriesToken;

  const selectedPartsLink = selected?.links?.find((l) => l.action === 'getGroupParts');
  const selectedHeaderHref =
    selected && subGroups.length > 0 && selectedPartsLink
      ? buildSubGroupPartsHref(
          basePath,
          selectedPartsLink.token,
          selected.name,
          activeToken,
          otherToken,
          view,
          vin,
          model,
          vehicleInfoToken,
          selected.name
        )
      : undefined;

  const groupsHref = buildViewHref(
    basePath,
    'groups',
    groupsToken,
    categoriesToken,
    vin,
    model,
    vehicleInfoToken
  );
  const categoriesHref = buildViewHref(
    basePath,
    'categories',
    groupsToken,
    categoriesToken,
    vin,
    model,
    vehicleInfoToken
  );

  return (
    <div>
      <Breadcrumb
        segments={[
          ...breadcrumbSegments,
          ...(selected ? [{ label: selected.name }] : []),
        ]}
      />

      <div className="mt-4">
        <div className="mb-3 flex items-center gap-3">
          {groupsToken && categoriesToken ? (
            <div className="inline-flex rounded-lg border border-border bg-muted/30 p-1">
              <Link
                href={groupsHref ?? '#'}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  view === 'groups'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t('groups', lang)}
              </Link>
              <Link
                href={categoriesHref ?? '#'}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  view === 'categories'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t('categories', lang)}
              </Link>
            </div>
          ) : (
            <div />
          )}

          <div className="relative w-80">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id={searchInputId}
              name="groupsSearch"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchGroupsPlaceholder', lang)}
              className="w-full rounded-md border border-border bg-background py-2.5 pl-9 pr-9 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label={t('cancel', lang)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex h-[calc(100vh-12rem)] overflow-hidden rounded-xl border border-border">
          {/* Left panel: top-level groups */}
          <div className="w-56 shrink-0 overflow-y-auto border-r border-border bg-muted/30">
            {topGroups.length === 0 ? (
              <p className="px-3 py-2.5 text-sm text-muted-foreground">{t('noResults', lang)}</p>
            ) : (
              <ul className="py-1">
                {topGroups.map((group, i) => (
                  <li key={group.token ?? group.name ?? i}>
                    <button
                      onClick={() => setSelectedKey(group.name)}
                      className={cn(
                        'w-full px-3 py-2.5 text-left text-sm transition-colors',
                        selected === group
                          ? 'bg-primary/10 font-medium text-primary'
                          : 'hover:bg-muted text-foreground'
                      )}
                    >
                      {group.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right panel: sub-groups */}
          <div className="flex-1 overflow-y-auto">
            {selected && (
              <div>
                <div className="border-b border-border px-4 py-3">
                  <h2 className="font-semibold">
                    {selectedHeaderHref ? (
                      <Link
                        href={selectedHeaderHref}
                        className="flex items-center justify-between hover:underline"
                      >
                        <span>{selected.name}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    ) : (
                      selected.name
                    )}
                  </h2>
                </div>
                {subGroups.length === 0 &&
                  selected.links?.some(
                    (l) => l.action === 'getGroupParts' || l.action === 'getUnits'
                  ) && (
                    <div className="p-4">
                      <SubGroupItem
                        group={selected}
                        brand={brand}
                        basePath={basePath}
                        groupsToken={activeToken}
                        otherToken={otherToken}
                        view={view}
                        vin={vin}
                        model={model}
                        vehicleInfoToken={vehicleInfoToken}
                        mainGroupName={selected.name}
                        lang={lang}
                        matchCodes={matchCodes}
                        searchQuery={categoriesSearchQuery}
                      />
                    </div>
                  )}
                {subGroups.length > 0 && visibleSubGroups.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-muted-foreground">{t('noResults', lang)}</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {visibleSubGroups.map((sub, i) => (
                      <li key={sub.token ?? sub.name ?? i} className="px-4 py-2">
                        <SubGroupItem
                          group={sub}
                          brand={brand}
                          basePath={basePath}
                          groupsToken={activeToken}
                          otherToken={otherToken}
                          view={view}
                          vin={vin}
                          model={model}
                          vehicleInfoToken={vehicleInfoToken}
                          mainGroupName={selected.name}
                          lang={lang}
                          matchCodes={matchCodes}
                          searchQuery={categoriesSearchQuery}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function buildSubGroupPartsHref(
  basePath: string,
  partsToken: string,
  groupName: string,
  groupsToken: string | undefined,
  otherToken: string | undefined,
  view: TreeView,
  vin: string | undefined,
  model: string | undefined,
  vehicleInfoToken: string | undefined,
  mainGroupName: string | undefined
): string {
  const params = new URLSearchParams({ token: partsToken });
  if (groupsToken) params.set('groupsToken', groupsToken);
  if (otherToken) params.set('otherToken', otherToken);
  if (view === 'categories') params.set('view', view);
  if (vin) params.set('vin', vin);
  if (model) params.set('model', model);
  if (vehicleInfoToken) params.set('vehicleInfoToken', vehicleInfoToken);
  if (mainGroupName) params.set('group', mainGroupName);
  params.set('subgroup', groupName);
  return `${basePath}/groups/parts?${params}`;
}

interface SubGroupItemProps {
  group: GroupNodeV2Dto;
  brand: string;
  basePath: string;
  groupsToken?: string;
  otherToken?: string;
  view: TreeView;
  vin?: string;
  model?: string;
  vehicleInfoToken?: string;
  mainGroupName?: string;
  lang: Lang;
  matchCodes?: string[];
  searchQuery?: string;
}

function SubGroupItem({
  group,
  brand,
  basePath,
  groupsToken,
  otherToken,
  view,
  vin,
  model,
  vehicleInfoToken,
  mainGroupName,
  lang,
  matchCodes,
  searchQuery,
}: SubGroupItemProps) {
  const partsLink = group.links?.find((l) => l.action === 'getGroupParts');
  const unitsLink =
    view === 'categories' ? group.links?.find((l) => l.action === 'getUnits') : undefined;
  const hasChildren = (group.children?.length ?? 0) > 0;

  if (!partsLink && !unitsLink && !hasChildren) {
    return (
      <span className="text-sm text-muted-foreground">{group.name}</span>
    );
  }

  // Children take priority: some nodes (e.g. "Disc Brake") carry both a
  // direct getGroupParts link AND children — drilling into the children
  // must win, or the children are silently dropped.
  if (!hasChildren && unitsLink) {
    return (
      <CategoryUnitsList
        token={unitsLink.token}
        basePath={basePath}
        groupsToken={groupsToken}
        otherToken={otherToken}
        vin={vin}
        model={model}
        vehicleInfoToken={vehicleInfoToken}
        mainGroupName={mainGroupName}
        lang={lang}
        matchCodes={matchCodes}
        searchQuery={searchQuery}
      />
    );
  }

  if (!hasChildren && partsLink) {
    const href = buildSubGroupPartsHref(
      basePath,
      partsLink.token,
      group.name,
      groupsToken,
      otherToken,
      view,
      vin,
      model,
      vehicleInfoToken,
      mainGroupName
    );
    return (
      <Link
        href={href}
        className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-muted transition-colors group"
      >
        <span className="font-medium">{group.name}</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </Link>
    );
  }

  // Has sub-children — if the group also carries its own combined parts
  // link, its name is the link to that combined view (e.g. "Filters",
  // "Disc Brake"); otherwise it's just a static header.
  const headerHref = partsLink
    ? buildSubGroupPartsHref(
        basePath,
        partsLink.token,
        group.name,
        groupsToken,
        otherToken,
        view,
        vin,
        model,
        vehicleInfoToken,
        mainGroupName
      )
    : undefined;

  return (
    <div className="space-y-1">
      {headerHref ? (
        <Link
          href={headerHref}
          className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm font-medium hover:bg-muted transition-colors group"
        >
          <span>{group.name}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>
      ) : (
        <span className="text-sm font-medium">{group.name}</span>
      )}
      {group.children && (
        <ul className="ml-3 space-y-0.5">
          {group.children.map((child, ci) => (
            <li key={child.token ?? ci}>
              <SubGroupItem
                group={child}
                brand={brand}
                basePath={basePath}
                groupsToken={groupsToken}
                otherToken={otherToken}
                view={view}
                vin={vin}
                model={model}
                vehicleInfoToken={vehicleInfoToken}
                mainGroupName={mainGroupName}
                lang={lang}
                matchCodes={matchCodes}
                searchQuery={searchQuery}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface CategoryUnitsListProps {
  token: string;
  basePath: string;
  groupsToken?: string;
  otherToken?: string;
  vin?: string;
  model?: string;
  vehicleInfoToken?: string;
  mainGroupName?: string;
  lang: Lang;
  matchCodes?: string[];
  searchQuery?: string;
}

const unitsRequestCache = new Map<string, Promise<UnitShortV2Dto[]>>();

function fetchUnitsCached(token: string, lang: Lang): Promise<UnitShortV2Dto[]> {
  const cacheKey = `${token}:${lang}`;
  let cached = unitsRequestCache.get(cacheKey);
  if (!cached) {
    cached = getUnits(token).then((res) => res.data?.units ?? []);
    unitsRequestCache.set(cacheKey, cached);
  }
  return cached;
}

function CategoryUnitsList({
  token,
  basePath,
  groupsToken,
  otherToken,
  vin,
  model,
  vehicleInfoToken,
  mainGroupName,
  lang,
  matchCodes,
  searchQuery,
}: CategoryUnitsListProps) {
  const [state, setState] = useState<{
    token: string;
    lang: Lang;
    units: UnitShortV2Dto[] | null;
  }>({
    token,
    lang,
    units: null,
  });
  const loading = state.token !== token || state.lang !== lang || state.units === null;

  useEffect(() => {
    let active = true;
    fetchUnitsCached(token, lang).then((units) => {
      if (!active) return;
      setState({ token, lang, units });
    });
    return () => {
      active = false;
    };
  }, [token, lang]);

  if (loading) {
    return <p className="px-2 py-1.5 text-sm text-muted-foreground">{t('loading', lang)}</p>;
  }

  const units = state.units;
  if (!units || units.length === 0) {
    return <p className="px-2 py-1.5 text-sm text-muted-foreground">{t('noResults', lang)}</p>;
  }

  return (
    <UnitsTable
      units={units}
      unitsToken={token}
      basePath={basePath}
      groupsToken={groupsToken}
      otherToken={otherToken}
      vin={vin}
      model={model}
      vehicleInfoToken={vehicleInfoToken}
      mainGroupName={mainGroupName}
      lang={lang}
      matchCodes={matchCodes}
      searchQuery={searchQuery}
    />
  );
}

interface UnitsTableProps {
  units: UnitShortV2Dto[];
  unitsToken: string;
  basePath: string;
  groupsToken?: string;
  otherToken?: string;
  vin?: string;
  model?: string;
  vehicleInfoToken?: string;
  mainGroupName?: string;
  lang: Lang;
  matchCodes?: string[];
  searchQuery?: string;
}

export function UnitsTable({
  units,
  unitsToken,
  basePath,
  groupsToken,
  otherToken,
  vin,
  model,
  vehicleInfoToken,
  mainGroupName,
  lang,
  matchCodes,
  searchQuery,
}: UnitsTableProps) {
  const router = useRouter();
  // Columns are derived from the full unit set so the table header doesn't
  // shift as the search narrows which rows are visible.
  const columns = useMemo(() => computeAttrColumns(units), [units]);

  // Matches against description + the attribute columns (e.g. "Note") —
  // the same text the user actually sees in the table, not the unit code.
  const visibleUnits = useMemo(() => {
    if (!searchQuery) return units;
    return units.filter((unit) => {
      if (cleanText(unit.name).toLowerCase().includes(searchQuery)) return true;
      return columns.some((col) =>
        attrCellLines(unit.attributes, col.code).some((line) =>
          cleanText(line).toLowerCase().includes(searchQuery)
        )
      );
    });
  }, [units, columns, searchQuery]);

  function buildHref(unit: UnitShortV2Dto, partsToken: string): string {
    const params = new URLSearchParams({
      token: partsToken,
      unitsToken,
      view: 'categories',
    });
    if (groupsToken) params.set('groupsToken', groupsToken);
    if (otherToken) params.set('otherToken', otherToken);
    if (unit.code) params.set('unitCode', unit.code);
    if (vin) params.set('vin', vin);
    if (model) params.set('model', model);
    if (vehicleInfoToken) params.set('vehicleInfoToken', vehicleInfoToken);
    if (mainGroupName) params.set('group', mainGroupName);
    params.set('subgroup', cleanText(unit.name));
    return `${basePath}/groups/parts?${params}`;
  }

  return (
    <table className="w-full text-sm">
      <thead className="sticky top-0 border-b border-border bg-muted/30">
        <tr>
          <th className="px-2 py-1.5 text-left font-medium text-xs text-muted-foreground w-24">
            {t('unitCode', lang)}
          </th>
          <th className="px-2 py-1.5 text-left font-medium text-xs text-muted-foreground">
            {t('partName', lang)}
          </th>
          {columns.map((col) => (
            <th
              key={col.code}
              className="px-2 py-1.5 text-left font-medium text-xs text-muted-foreground hidden lg:table-cell"
            >
              {col.label}
            </th>
          ))}
          <th className="w-8" />
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {visibleUnits.length === 0 && (
          <tr>
            <td
              colSpan={columns.length + 3}
              className="px-2 py-3 text-sm text-muted-foreground"
            >
              {t('noResults', lang)}
            </td>
          </tr>
        )}
        {visibleUnits.map((unit, ui) => {
          const partsLink = unit.links?.find((l) => l.action === 'getUnitParts');
          const href = partsLink ? buildHref(unit, partsLink.token) : undefined;

          return (
            <tr
              key={`${unit.token ?? unit.code ?? 'unit'}-${ui}`}
              onClick={href ? () => router.push(href) : undefined}
              className={cn(
                'transition-colors',
                href ? 'cursor-pointer hover:bg-muted/60' : 'text-muted-foreground'
              )}
            >
              <td className="px-2 py-1.5 font-mono text-xs">{unit.code}</td>
              <td className="px-2 py-1.5 font-medium">{cleanText(unit.name)}</td>
              {columns.map((col) => {
                const lines = attrCellLines(unit.attributes, col.code).map(cleanText);
                return (
                  <td
                    key={col.code}
                    className="px-2 py-1.5 text-xs text-muted-foreground hidden lg:table-cell"
                  >
                    {lines.length
                      ? lines.map((line, i) => <div key={i}>{highlightCodes(line, matchCodes)}</div>)
                      : '—'}
                  </td>
                );
              })}
              <td className="px-2 py-1.5">
                {href && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
