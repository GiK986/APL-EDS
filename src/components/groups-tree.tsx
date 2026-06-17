'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GroupNodeV2Dto } from '@/types/yq';

interface GroupsTreeProps {
  tree: GroupNodeV2Dto;
  brand: string;
  basePath: string;
  groupsToken?: string;
  vin?: string;
  model?: string;
}

export function GroupsTree({ tree, brand, basePath, groupsToken, vin, model }: GroupsTreeProps) {
  const [selected, setSelected] = useState<GroupNodeV2Dto | null>(
    tree.children?.[0] ?? null
  );

  const topGroups = tree.children ?? [];
  const subGroups = selected?.children ?? [];

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-border">
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
            {subGroups.length === 0 && selected.links?.some(l => l.action === 'getGroupParts') && (
              <div className="p-4">
                <SubGroupItem
                  group={selected}
                  brand={brand}
                  basePath={basePath}
                  groupsToken={groupsToken}
                  vin={vin}
                  model={model}
                  mainGroupName={selected.name}
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
                    groupsToken={groupsToken}
                    vin={vin}
                    model={model}
                    mainGroupName={selected.name}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

interface SubGroupItemProps {
  group: GroupNodeV2Dto;
  brand: string;
  basePath: string;
  groupsToken?: string;
  vin?: string;
  model?: string;
  mainGroupName?: string;
}

function SubGroupItem({
  group,
  brand,
  basePath,
  groupsToken,
  vin,
  model,
  mainGroupName,
}: SubGroupItemProps) {
  const partsLink = group.links?.find((l) => l.action === 'getGroupParts');
  const hasChildren = (group.children?.length ?? 0) > 0;

  if (!partsLink && !hasChildren) {
    return (
      <span className="text-sm text-muted-foreground">{group.name}</span>
    );
  }

  if (partsLink) {
    const params = new URLSearchParams({ token: partsLink.token });
    if (groupsToken) params.set('groupsToken', groupsToken);
    if (vin) params.set('vin', vin);
    if (model) params.set('model', model);
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
                vin={vin}
                model={model}
                mainGroupName={mainGroupName}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
