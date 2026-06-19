import { notFound } from 'next/navigation';
import {
  getGroupParts,
  getPartApplicability,
  getUnitInfo,
  getGroups,
  getNavigationTree,
  getUnits,
  getUnitParts,
  getLang,
} from '@/actions/yq';
import { PartsTable } from '@/components/parts-table';
import { Breadcrumb } from '@/components/catalog/breadcrumb';
import { cleanText } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { Lang } from '@/lib/i18n';
import type { CategoryV2Dto, GroupNodeV2Dto, UnitInfoV2Dto, UnitShortV2Dto } from '@/types/yq';

type TreeView = 'groups' | 'categories';

async function buildUnitInfoMap(
  categories: CategoryV2Dto[]
): Promise<Record<string, UnitInfoV2Dto>> {
  const unitInfoMap: Record<string, UnitInfoV2Dto> = {};
  const entries = await Promise.all(
    categories.flatMap((cat, ci) =>
      cat.units.map(async (unitData, ui) => {
        const infoLink = unitData.unit.links?.find((l) => l.action === 'getUnitInfo');
        if (!infoLink) return null;
        const infoRes = await getUnitInfo(infoLink.token);
        if (infoRes.error || !infoRes.data) return null;
        return [`${ci}-${ui}`, infoRes.data] as const;
      })
    )
  );
  for (const entry of entries) {
    if (entry) unitInfoMap[entry[0]] = entry[1];
  }
  return unitInfoMap;
}

function flattenLeaves(node: GroupNodeV2Dto): GroupNodeV2Dto[] {
  const leaves: GroupNodeV2Dto[] = [];
  function walk(n: GroupNodeV2Dto) {
    if (n.links?.some((l) => l.action === 'getGroupParts')) leaves.push(n);
    n.children?.forEach(walk);
  }
  walk(node);
  return leaves;
}

function buildPartsHref(
  brand: string,
  leaf: GroupNodeV2Dto,
  groupsToken: string,
  otherToken: string | undefined,
  vin: string | undefined,
  model: string | undefined,
  vehicleInfoToken: string | undefined,
  mainGroupName: string | undefined,
  view: TreeView
): string | undefined {
  const link = leaf.links?.find((l) => l.action === 'getGroupParts');
  if (!link) return undefined;
  const params = new URLSearchParams({ token: link.token, groupsToken });
  if (otherToken) params.set('otherToken', otherToken);
  if (view === 'categories') params.set('view', view);
  if (vin) params.set('vin', vin);
  if (model) params.set('model', model);
  if (vehicleInfoToken) params.set('vehicleInfoToken', vehicleInfoToken);
  if (mainGroupName) params.set('group', mainGroupName);
  params.set('subgroup', leaf.name);
  return `/catalog/${brand}/groups/parts?${params}`;
}

function buildUnitPartsHref(
  brand: string,
  unit: UnitShortV2Dto,
  unitsToken: string,
  groupsToken: string | undefined,
  otherToken: string | undefined,
  vin: string | undefined,
  model: string | undefined,
  vehicleInfoToken: string | undefined,
  group: string | undefined
): string | undefined {
  const link = unit.links?.find((l) => l.action === 'getUnitParts');
  if (!link) return undefined;
  const params = new URLSearchParams({ token: link.token, unitsToken, view: 'categories' });
  if (groupsToken) params.set('groupsToken', groupsToken);
  if (otherToken) params.set('otherToken', otherToken);
  if (unit.code) params.set('unitCode', unit.code);
  if (vin) params.set('vin', vin);
  if (model) params.set('model', model);
  if (vehicleInfoToken) params.set('vehicleInfoToken', vehicleInfoToken);
  if (group) params.set('group', group);
  params.set('subgroup', unit.name);
  return `/catalog/${brand}/groups/parts?${params}`;
}

interface PageProps {
  params: Promise<{ brand: string }>;
  searchParams: Promise<{
    token?: string;
    groupsToken?: string;
    otherToken?: string;
    unitsToken?: string;
    unitCode?: string;
    view?: string;
    vin?: string;
    model?: string;
    vehicleInfoToken?: string;
    group?: string;
    subgroup?: string;
    mode?: string;
    partToken?: string;
    partNumber?: string;
    includeReplacements?: string;
  }>;
}

export default async function PartsPage({ params, searchParams }: PageProps) {
  const [
    { brand },
    {
      token,
      groupsToken,
      otherToken,
      unitsToken,
      unitCode,
      view: viewParam,
      vin,
      model,
      vehicleInfoToken,
      group,
      subgroup,
      mode,
      partToken,
      partNumber,
      includeReplacements,
    },
  ] = await Promise.all([params, searchParams]);
  const lang = (await getLang()) as Lang;
  const view: TreeView = viewParam === 'categories' ? 'categories' : 'groups';
  const isApplicabilityFlow = mode === 'applicability';
  const isUnitFlow = !isApplicabilityFlow && view === 'categories' && !!unitsToken;

  if (!isApplicabilityFlow && !token) return notFound();
  if (isApplicabilityFlow && (!partToken || !partNumber)) return notFound();

  let categories: CategoryV2Dto[];
  let unitInfoMap: Record<string, UnitInfoV2Dto> = {};
  let diagramNav: { label: string; prevHref?: string; nextHref?: string } | undefined;
  let allPartsToken: string | undefined;

  if (isApplicabilityFlow) {
    const applicabilityRes = await getPartApplicability(partToken!, [
      { name: 'PartNumber', value: partNumber! },
      { name: 'IncludeReplacements', value: includeReplacements ?? 'false' },
    ]);
    if (applicabilityRes.error || !applicabilityRes.data) return notFound();
    categories = applicabilityRes.data.categories;
    unitInfoMap = await buildUnitInfoMap(categories);
  } else if (isUnitFlow) {
    const unitPartsRes = await getUnitParts(token!);
    if (unitPartsRes.error || !unitPartsRes.data) return notFound();

    const unitsRes = await getUnits(unitsToken!);
    const allUnits = unitsRes.data?.units ?? [];
    const idx = allUnits.findIndex(
      (u) =>
        (unitCode && u.code === unitCode) ||
        u.links?.some((l) => l.action === 'getUnitParts' && l.token === token)
    );
    const currentUnit = idx !== -1 ? allUnits[idx] : undefined;

    const infoLink = currentUnit?.links?.find((l) => l.action === 'getUnitInfo');
    if (infoLink) {
      const infoRes = await getUnitInfo(infoLink.token);
      if (!infoRes.error && infoRes.data) unitInfoMap['0-0'] = infoRes.data;
    }

    categories = [
      {
        category: { code: group ?? '', name: group ?? subgroup ?? '' },
        units: [
          {
            unit: currentUnit ?? { code: unitCode ?? '', name: subgroup ?? '' },
            partSections: unitPartsRes.data.partSections,
            imageNames: currentUnit?.imageNames,
          },
        ],
      },
    ];

    if (idx !== -1) {
      const current = allUnits[idx];
      const prev = idx > 0 ? allUnits[idx - 1] : undefined;
      const next = idx < allUnits.length - 1 ? allUnits[idx + 1] : undefined;
      diagramNav = {
        label:
          current.code && current.name && current.name !== current.code
            ? `${current.code} — ${cleanText(current.name)}`
            : current.code || cleanText(current.name),
        prevHref: prev
          ? buildUnitPartsHref(
              brand,
              prev,
              unitsToken!,
              groupsToken,
              otherToken,
              vin,
              model,
              vehicleInfoToken,
              group
            )
          : undefined,
        nextHref: next
          ? buildUnitPartsHref(
              brand,
              next,
              unitsToken!,
              groupsToken,
              otherToken,
              vin,
              model,
              vehicleInfoToken,
              group
            )
          : undefined,
      };
    }
  } else {
    const partsRes = await getGroupParts(token!);
    if (partsRes.error || !partsRes.data) return notFound();
    categories = partsRes.data.categories;
    unitInfoMap = await buildUnitInfoMap(categories);

    if (groupsToken && group) {
      const groupsRes =
        view === 'categories'
          ? await getNavigationTree(groupsToken)
          : await getGroups(groupsToken);
      const mainGroupNode = groupsRes.data?.children?.find((g) => g.name === group);
      if (mainGroupNode) {
        const leaves = flattenLeaves(mainGroupNode);
        const idx = leaves.findIndex((l) => l.name === subgroup);
        if (idx !== -1) {
          const current = leaves[idx];
          const prev = idx > 0 ? leaves[idx - 1] : undefined;
          const next = idx < leaves.length - 1 ? leaves[idx + 1] : undefined;
          diagramNav = {
            label:
              current.code && current.name && current.name !== current.code
                ? `${current.code} — ${cleanText(current.name)}`
                : current.code || cleanText(current.name),
            prevHref: prev
              ? buildPartsHref(
                  brand,
                  prev,
                  groupsToken,
                  otherToken,
                  vin,
                  model,
                  vehicleInfoToken,
                  group,
                  view
                )
              : undefined,
            nextHref: next
              ? buildPartsHref(
                  brand,
                  next,
                  groupsToken,
                  otherToken,
                  vin,
                  model,
                  vehicleInfoToken,
                  group,
                  view
                )
              : undefined,
          };
          allPartsToken = current.links?.find((l) => l.action === 'getGroupPartsAll')?.token;
        }
      }
    }
  }

  const brandLabel = decodeURIComponent(brand)
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const groupsParams = new URLSearchParams();
  if (groupsToken) groupsParams.set(view === 'categories' ? 'navToken' : 'token', groupsToken);
  if (otherToken) groupsParams.set(view === 'categories' ? 'token' : 'navToken', otherToken);
  if (view === 'categories') groupsParams.set('view', view);
  if (vin) groupsParams.set('vin', vin);
  if (model) groupsParams.set('model', model);
  if (vehicleInfoToken) groupsParams.set('vehicleInfoToken', vehicleInfoToken);
  if (group) groupsParams.set('group', group);
  const groupsHref = `/catalog/${brand}/groups${groupsParams.toString() ? `?${groupsParams}` : ''}`;

  return (
    <div className="px-4 py-4 sm:px-6">
      <Breadcrumb
        segments={[
          { label: t('start', lang), href: '/' },
          { label: brandLabel, href: `/catalog/${brand}` },
          ...(vin ? [{ label: vin, href: groupsHref }] : []),
          { label: model || t('groups', lang), href: groupsHref },
          ...(group ? [{ label: cleanText(group), href: groupsHref }] : []),
          diagramNav
            ? {
                label: diagramNav.label,
                nav: { prevHref: diagramNav.prevHref, nextHref: diagramNav.nextHref },
              }
            : {
                label: isApplicabilityFlow
                  ? partNumber!
                  : subgroup
                    ? cleanText(subgroup)
                    : t('parts', lang),
              },
        ]}
      />

      <div className="mt-4">
        <PartsTable
          categories={categories}
          unitInfoMap={unitInfoMap}
          allPartsToken={allPartsToken}
          lang={lang}
          tall={isUnitFlow}
        />
      </div>
    </div>
  );
}
