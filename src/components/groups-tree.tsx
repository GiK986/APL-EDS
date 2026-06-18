'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t, type Lang } from '@/lib/i18n';
import { getUnits } from '@/actions/yq';
import type { GroupNodeV2Dto, UnitShortV2Dto } from '@/types/yq';

type TreeView = 'groups' | 'categories';

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
  lang: Lang;
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
  lang,
}: GroupsTreeProps) {
  const [selected, setSelected] = useState<GroupNodeV2Dto | null>(
    tree.children?.[0] ?? null
  );

  const topGroups = tree.children ?? [];
  const subGroups = selected?.children ?? [];
  const activeToken = view === 'categories' ? categoriesToken : groupsToken;

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
      {groupsToken && categoriesToken && (
        <div className="mb-3 inline-flex rounded-lg border border-border bg-muted/30 p-1">
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
      )}

      <div className="flex h-[calc(100vh-12rem)] overflow-hidden rounded-xl border border-border">
        {/* Left panel: top-level groups */}
        <div className="w-56 shrink-0 overflow-y-auto border-r border-border bg-muted/30">
          <ul className="py-1">
            {topGroups.map((group, i) => (
              <li key={group.token ?? group.name ?? i}>
                <button
                  onClick={() => setSelected(group)}
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
        </div>

        {/* Right panel: sub-groups */}
        <div className="flex-1 overflow-y-auto">
          {selected && (
            <div>
              <div className="border-b border-border px-4 py-3">
                <h2 className="font-semibold">{selected.name}</h2>
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
                      view={view}
                      vin={vin}
                      model={model}
                      vehicleInfoToken={vehicleInfoToken}
                      mainGroupName={selected.name}
                      lang={lang}
                    />
                  </div>
                )}
              <ul className="divide-y divide-border">
                {subGroups.map((sub, i) => (
                  <li key={sub.token ?? sub.name ?? i} className="px-4 py-2">
                    <SubGroupItem
                      group={sub}
                      brand={brand}
                      basePath={basePath}
                      groupsToken={activeToken}
                      view={view}
                      vin={vin}
                      model={model}
                      vehicleInfoToken={vehicleInfoToken}
                      mainGroupName={selected.name}
                      lang={lang}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface SubGroupItemProps {
  group: GroupNodeV2Dto;
  brand: string;
  basePath: string;
  groupsToken?: string;
  view: TreeView;
  vin?: string;
  model?: string;
  vehicleInfoToken?: string;
  mainGroupName?: string;
  lang: Lang;
}

function SubGroupItem({
  group,
  brand,
  basePath,
  groupsToken,
  view,
  vin,
  model,
  vehicleInfoToken,
  mainGroupName,
  lang,
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

  if (unitsLink) {
    return (
      <CategoryUnitsList
        token={unitsLink.token}
        basePath={basePath}
        groupsToken={groupsToken}
        vin={vin}
        model={model}
        vehicleInfoToken={vehicleInfoToken}
        mainGroupName={mainGroupName}
        lang={lang}
      />
    );
  }

  if (partsLink) {
    const params = new URLSearchParams({ token: partsLink.token });
    if (groupsToken) params.set('groupsToken', groupsToken);
    if (view === 'categories') params.set('view', view);
    if (vin) params.set('vin', vin);
    if (model) params.set('model', model);
    if (vehicleInfoToken) params.set('vehicleInfoToken', vehicleInfoToken);
    if (mainGroupName) params.set('group', mainGroupName);
    params.set('subgroup', group.name);
    const href = `${basePath}/groups/parts?${params}`;
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

  // Has sub-children, no direct parts link
  return (
    <div className="space-y-1">
      <span className="text-sm font-medium">{group.name}</span>
      {group.children && (
        <ul className="ml-3 space-y-0.5">
          {group.children.map((child, ci) => (
            <li key={child.token ?? ci}>
              <SubGroupItem
                group={child}
                brand={brand}
                basePath={basePath}
                groupsToken={groupsToken}
                view={view}
                vin={vin}
                model={model}
                vehicleInfoToken={vehicleInfoToken}
                mainGroupName={mainGroupName}
                lang={lang}
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
  vin?: string;
  model?: string;
  vehicleInfoToken?: string;
  mainGroupName?: string;
  lang: Lang;
}

function CategoryUnitsList({
  token,
  basePath,
  groupsToken,
  vin,
  model,
  vehicleInfoToken,
  mainGroupName,
  lang,
}: CategoryUnitsListProps) {
  const [state, setState] = useState<{ token: string; units: UnitShortV2Dto[] | null }>({
    token,
    units: null,
  });
  const loading = state.token !== token || state.units === null;

  useEffect(() => {
    let active = true;
    getUnits(token).then((res) => {
      if (!active) return;
      setState({ token, units: res.data?.units ?? [] });
    });
    return () => {
      active = false;
    };
  }, [token]);

  if (loading) {
    return <p className="px-2 py-1.5 text-sm text-muted-foreground">{t('loading', lang)}</p>;
  }

  const units = state.units;
  if (!units || units.length === 0) {
    return <p className="px-2 py-1.5 text-sm text-muted-foreground">{t('noResults', lang)}</p>;
  }

  return (
    <ul className="space-y-0.5">
      {units.map((unit, ui) => {
        const partsLink = unit.links?.find((l) => l.action === 'getUnitParts');
        const label = unit.code ? `${unit.code} — ${unit.name}` : unit.name;

        if (!partsLink) {
          return (
            <li key={unit.code ?? unit.token ?? ui} className="px-2 py-1.5 text-sm text-muted-foreground">
              {label}
            </li>
          );
        }

        const params = new URLSearchParams({
          token: partsLink.token,
          unitsToken: token,
          view: 'categories',
        });
        if (groupsToken) params.set('groupsToken', groupsToken);
        if (unit.code) params.set('unitCode', unit.code);
        if (vin) params.set('vin', vin);
        if (model) params.set('model', model);
        if (vehicleInfoToken) params.set('vehicleInfoToken', vehicleInfoToken);
        if (mainGroupName) params.set('group', mainGroupName);
        params.set('subgroup', unit.name);
        const href = `${basePath}/groups/parts?${params}`;

        return (
          <li key={unit.code ?? unit.token ?? ui}>
            <Link
              href={href}
              className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-muted transition-colors group"
            >
              <span className="font-medium">{label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
