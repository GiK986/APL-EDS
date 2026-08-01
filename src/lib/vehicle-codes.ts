import type { VehicleV2Dto } from '@/types/yq';
import { resolveExtractionRules } from '@/lib/tecdoc-vehicle-rules';

export const ENGINE_ATTR_CODES = ['engine', 'enginecode', 'motor', 'motorcode'];
const TRANSMISSION_ATTR_CODES = ['gearbox', 'transmission', 'getriebe'];
// Opel (GM-era) reports this under "production_date" instead of "date" —
// live-verified, no "manufactured" attribute at all for that catalog either.
const DATE_ATTR_CODES = ['date', 'production_date'];

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

// Attributes that, across the brands seen so far, sometimes carry the
// manufacturer engine code buried inside a longer free-text description
// (e.g. Mercedes has no clean "engine" attribute at all — the code shows up
// as "OM640" inside "aggregates": "M - Engine: 640940 ... (640.940 OM640,
// R4 DIESEL ENGINE OM640 DE 20 LA); ...").
const ENGINE_TEXT_FALLBACK_CODES = ['aggregates', 'engine_info', 'description'];

// A "code-shaped" token: starts with a letter, 3-8 chars total. Kept if it
// contains a digit (catches "B38N", "DV5RC", "OM640") or is short pure
// letters (catches "CHYB"-style codes with no digit at all) — long pure-word
// tokens ("ENGINE", "DIESEL") are dropped since real engine codes are rarely
// >5 letters with zero digits.
function codeShapedTokens(text: string): string[] {
  const tokens = text.toUpperCase().match(/[A-Z][A-Z0-9]{2,7}/g) ?? [];
  return tokens.filter((t) => /[0-9]/.test(t) || t.length <= 5);
}

// Some brands (seen live on BMW: YQ's "B38N" vs TecDoc's own "B38 A15 M")
// use a trailing variant letter that doesn't correspond to TecDoc's own
// suffix at all — only the "family" prefix (letters + digit run) is shared.
// Adding that shorter stem as an extra candidate lets those still surface as
// TecDoc matches, disambiguated afterwards by the kW/HP/date scoring instead
// of by the suffix letter.
function withStems(tokens: string[]): string[] {
  const stems = tokens
    .map((t) => t.match(/^[A-Z]{1,4}[0-9]{2,5}/)?.[0])
    .filter((s): s is string => Boolean(s));
  return [...tokens, ...stems];
}

// Returns candidate manufacturer engine codes for TecDoc K-Type matching —
// deliberately over-inclusive (real code plus some harmless noise tokens is
// fine, the caller validates each candidate against TecDoc's own engine
// table and noise simply won't match anything there).
export function extractEngineCodeCandidates(vehicle: VehicleV2Dto): string[] {
  const attrs = vehicle.attributes ?? [];
  const clean = attrs.filter((a) => ENGINE_ATTR_CODES.includes(a.code.toLowerCase()));
  const source = clean.length
    ? clean
    : attrs.filter((a) => ENGINE_TEXT_FALLBACK_CODES.includes(a.code.toLowerCase()));
  const tokens = source.flatMap((a) => a.values.flatMap(codeShapedTokens));
  const rules = resolveExtractionRules(vehicle.brand);
  const candidates = rules.useEngineCodeStems === false ? tokens : withStems(tokens);
  return Array.from(new Set(candidates)).slice(0, 8);
}

// Parses kW/HP out of whatever free text carries them ("1000CC / 75hp /
// 55kW SRE", "B38N (115kW)") — used only as a scoring signal when ranking
// TecDoc K-Type candidates, never as a hard filter.
export function extractEnginePower(vehicle: VehicleV2Dto): { kw?: number; hp?: number } {
  const text = (vehicle.attributes ?? [])
    .filter((a) => ['engine', 'engine_info'].includes(a.code.toLowerCase()))
    .flatMap((a) => a.values)
    .join(' ');
  const kw = text.match(/(\d+)\s*kW/i)?.[1];
  const hp = text.match(/(\d+)\s*hp/i)?.[1];
  return { kw: kw ? Number(kw) : undefined, hp: hp ? Number(hp) : undefined };
}

// Vehicle production date as YYYYMM (matches TecDoc's ModYFrom/ModYTo
// format) for containment scoring — prefers the precise "date" attribute
// (DD.MM.YYYY) over the coarser year-only "manufactured" attribute.
export function extractVehicleYearMonth(vehicle: VehicleV2Dto): number | undefined {
  const attrs = vehicle.attributes ?? [];
  const date = attrs.find((a) => DATE_ATTR_CODES.includes(a.code.toLowerCase()))?.values[0];
  const dateMatch = date?.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (dateMatch) return Number(dateMatch[3]) * 100 + Number(dateMatch[2]);
  const year = attrs.find((a) => a.code.toLowerCase() === 'manufactured')?.values[0];
  if (year && /^\d{4}$/.test(year)) return Number(year) * 100 + 1;
  return undefined;
}

// Single authoritative engine code to push to TM1 via setEngineCode — unlike
// extractEngineCodeCandidates (deliberately over-inclusive for TecDoc fuzzy
// matching), this is just the first clean value YQ itself reports. Some
// brands may carry it under a different attribute, or not report one at all
// (returns undefined then) — only ENGINE_ATTR_CODES is checked for now.
export function extractEngineCode(vehicle: VehicleV2Dto): string | undefined {
  return findCodes(vehicle, ENGINE_ATTR_CODES)[0];
}

// ISO 8601 string, the format TM1's setVehicleProperties expects for
// initialRegistration (live-verified) — parsed from YQ's "date" attribute
// (DD.MM.YYYY). Some brands may carry this under a different attribute or
// not report one at all (returns undefined then).
export function extractInitialRegistration(vehicle: VehicleV2Dto): string | undefined {
  const date = (vehicle.attributes ?? []).find((a) =>
    DATE_ATTR_CODES.includes(a.code.toLowerCase())
  )?.values[0];
  const match = date?.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return undefined;
  const [, day, month, year] = match;
  return `${year}-${month}-${day}T00:00:00.000Z`;
}
