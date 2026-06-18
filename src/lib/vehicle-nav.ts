import type { VehicleV2Dto } from '@/types/yq';

const MODEL_LABEL_ATTR_CODES = ['series_description', 'modeldescription', 'model_description'];

function vehicleModelLabel(vehicle: VehicleV2Dto): string {
  const attr = vehicle.attributes.find((a) => MODEL_LABEL_ATTR_CODES.includes(a.code.toLowerCase()));
  return attr?.values[0] ?? vehicle.model;
}

export function buildVehicleGroupsHref(
  brand: string,
  vehicle: VehicleV2Dto,
  vin?: string
): string | null {
  const groupsLink = vehicle.navigationLinks.find((l) => l.code === 'GROUPS');
  const mainLink = vehicle.navigationLinks.find((l) => l.code === 'MAIN');
  const vehicleInfoLink = vehicle.links.find((l) => l.action === 'getVehicleInfo');
  if (!groupsLink) return null;
  const params = new URLSearchParams({
    token: groupsLink.token,
    navToken: mainLink?.token ?? '',
    model: vehicleModelLabel(vehicle),
  });
  if (vin) params.set('vin', vin);
  if (vehicleInfoLink) params.set('vehicleInfoToken', vehicleInfoLink.token);
  return `/catalog/${encodeURIComponent(brand)}/groups?${params}`;
}
