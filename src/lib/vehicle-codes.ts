import type { VehicleV2Dto } from '@/types/yq';

export const ENGINE_ATTR_CODES = ['engine', 'enginecode', 'motor', 'motorcode'];
const TRANSMISSION_ATTR_CODES = ['gearbox', 'transmission', 'getriebe'];

// Some vehicles pack multiple codes into a single attribute value (e.g.
// "FVH(5S);, GQQ(5S)") — split on the common separators so each one can be
// matched on its own; a diagram's Note text carries one at a time, not the
// joined value. Keep each whole segment instead of truncating it down to a
// leading token — the full segment is what actually shows up in Notes.
function extractCodes(value: string): string[] {
  return value
    .split(/[,;]+/)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
}

function findCodes(vehicle: VehicleV2Dto, attrCodes: string[]): string[] {
  const attr = (vehicle.attributes ?? []).find((a) => attrCodes.includes(a.code.toLowerCase()));
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
