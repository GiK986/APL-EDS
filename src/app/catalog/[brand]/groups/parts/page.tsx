import { notFound } from 'next/navigation';
import { getGroupParts, getUnitInfo, getGroups, getLang } from '@/actions/yq';
import { PartsTable } from '@/components/parts-table';
import { Breadcrumb } from '@/components/catalog/breadcrumb';
import { t } from '@/lib/i18n';
import type { Lang } from '@/lib/i18n';
import type { GroupNodeV2Dto, UnitInfoV2Dto } from '@/types/yq';

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
  vin: string | undefined,
  model: string | undefined,
  vehicleInfoToken: string | undefined,
  mainGroupName: string | undefined
): string | undefined {
  const link = leaf.links?.find((l) => l.action === 'getGroupParts');
  if (!link) return undefined;
  const params = new URLSearchParams({ token: link.token, groupsToken });
  if (vin) params.set('vin', vin);
  if (model) params.set('model', model);
  if (vehicleInfoToken) params.set('vehicleInfoToken', vehicleInfoToken);
  if (mainGroupName) params.set('group', mainGroupName);
  params.set('subgroup', leaf.name);
  return `/catalog/${brand}/groups/parts?${params}`;
}

interface PageProps {
  params: Promise<{ brand: string }>;
  searchParams: Promise<{
    token?: string;
    groupsToken?: string;
    vin?: string;
    model?: string;
    vehicleInfoToken?: string;
    group?: string;
    subgroup?: string;
  }>;
}

export default async function PartsPage({ params, searchParams }: PageProps) {
  const [{ brand }, { token, groupsToken, vin, model, vehicleInfoToken, group, subgroup }] =
    await Promise.all([params, searchParams]);
  const lang = (await getLang()) as Lang;

  if (!token) return notFound();

  const partsRes = await getGroupParts(token);
  if (partsRes.error || !partsRes.data) return notFound();

  const unitInfoEntries = await Promise.all(
    partsRes.data.categories.flatMap((cat, ci) =>
      cat.units.map(async (unitData, ui) => {
        const infoLink = unitData.unit.links?.find((l) => l.action === 'getUnitInfo');
        if (!infoLink) return null;
        const infoRes = await getUnitInfo(infoLink.token);
        if (infoRes.error || !infoRes.data) return null;
        return [`${ci}-${ui}`, infoRes.data] as const;
      })
    )
  );
  const unitInfoMap: Record<string, UnitInfoV2Dto> = {};
  for (const entry of unitInfoEntries) {
    if (entry) unitInfoMap[entry[0]] = entry[1];
  }

  let diagramNav: { label: string; prevHref?: string; nextHref?: string } | undefined;
  let allPartsToken: string | undefined;
  if (groupsToken && group) {
    const groupsRes = await getGroups(groupsToken);
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
              ? `${current.code} — ${current.name}`
              : current.code || current.name,
          prevHref: prev
            ? buildPartsHref(brand, prev, groupsToken, vin, model, vehicleInfoToken, group)
            : undefined,
          nextHref: next
            ? buildPartsHref(brand, next, groupsToken, vin, model, vehicleInfoToken, group)
            : undefined,
        };
        allPartsToken = current.links?.find((l) => l.action === 'getGroupPartsAll')?.token;
      }
    }
  }

  const brandLabel = decodeURIComponent(brand)
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const groupsParams = new URLSearchParams();
  if (groupsToken) groupsParams.set('token', groupsToken);
  if (vin) groupsParams.set('vin', vin);
  if (model) groupsParams.set('model', model);
  if (vehicleInfoToken) groupsParams.set('vehicleInfoToken', vehicleInfoToken);
  const groupsHref = `/catalog/${brand}/groups${groupsParams.toString() ? `?${groupsParams}` : ''}`;

  return (
    <div className="px-4 py-4 sm:px-6">
      <Breadcrumb
        segments={[
          { label: t('start', lang), href: '/' },
          { label: brandLabel, href: `/catalog/${brand}` },
          ...(vin ? [{ label: vin, href: groupsHref }] : []),
          { label: model || t('groups', lang), href: groupsHref },
          ...(group ? [{ label: group, href: groupsHref }] : []),
          diagramNav
            ? {
                label: diagramNav.label,
                nav: { prevHref: diagramNav.prevHref, nextHref: diagramNav.nextHref },
              }
            : { label: subgroup || t('parts', lang) },
        ]}
      />

      <div className="mt-4">
        <PartsTable
          categories={partsRes.data.categories}
          unitInfoMap={unitInfoMap}
          allPartsToken={allPartsToken}
          lang={lang}
        />
      </div>
    </div>
  );
}
