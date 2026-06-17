import type { VehicleV2Dto } from '@/types/yq';

export function buildVehicleGroupsHref(brand: string, vehicle: VehicleV2Dto): string | null {
  const groupsLink = vehicle.navigationLinks.find((l) => l.code === 'GROUPS');
  const mainLink = vehicle.navigationLinks.find((l) => l.code === 'MAIN');
  if (!groupsLink) return null;
  const params = new URLSearchParams({
    token: groupsLink.token,
    navToken: mainLink?.token ?? '',
  });
  return `/catalog/${encodeURIComponent(brand)}/groups?${params}`;
}
