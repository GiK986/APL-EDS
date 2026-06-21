import type { VehicleV2Dto } from '@/types/yq';

export const ENGINE_ATTR_CODES = ['engine', 'enginecode', 'motor', 'motorcode'];
const TRANSMISSION_ATTR_CODES = ['gearbox', 'transmission', 'getriebe'];

// Vehicle attribute values mix the short code catalogs reference (e.g.
// "BKC", "FVH") with descriptive text and multiple codes per field (e.g.
// "FVH(5S);, GQQ(5S)" or "N57Z (3000CC / 230kW)"). Split on the common
// separators and keep only the leading code token from each segment.
function extractCodes(value: string): string[] {
  return value
    .split(/[,;]+/)
    .map((segment) => segment.trim().match(/^[A-Z0-9]+/i)?.[0])
    .filter((code): code is string => !!code);
}

function findCodes(vehicle: VehicleV2Dto, attrCodes: string[]): string[] {
  const attr = vehicle.attributes.find((a) => attrCodes.includes(a.code.toLowerCase()));
  if (!attr) return [];
  return attr.values.flatMap(extractCodes);
}

// Only worth surfacing when the vehicle match is partial ("basic") — a
// "full" match means the catalog is already filtered exactly for this
// vehicle, so every visible diagram/part already applies.
export function getHighlightCodes(vehicle: VehicleV2Dto | null | undefined): string[] {
  if (!vehicle) return [];
  const filterLevel = vehicle.sysProperties.find((p) => p.code === 'filter_level')?.value;
  if (filterLevel === 'full') return [];
  return Array.from(
    new Set([...findCodes(vehicle, ENGINE_ATTR_CODES), ...findCodes(vehicle, TRANSMISSION_ATTR_CODES)])
  );
}
