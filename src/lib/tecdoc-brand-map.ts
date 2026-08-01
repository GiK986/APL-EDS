// Precise YQ brand -> TecDoc manufacturer mapping, replacing the ad-hoc
// BRAND_ALIASES + fuzzy substring match in actions/tecdoc.ts with actual
// DT100.ManNo lookups. Built by joining DT100 to DT012 (Term resolves the
// full manufacturer name, not just the truncated ManCode) and matching
// each YQ brand's normalized name against it — live-verified against
// TECDOC_DATA, one query per brand, 2026-08-01.
//
// tecdocManNo is an array, not a single value, because some YQ brands map
// to more than one DT100 row (regional sub-brands, or — as with Opel — a
// platform-era split: "Opel" (GM-era) vs "Opel (PSA)" (post-2017, PSA
// platforms) are two separate YQ catalogs but vehicle.brand reports "OPEL"
// for both, so we can't tell which TecDoc manufacturer applies without
// also looking at the catalog name).
export interface TecDocBrandMapping {
  /** DT100.ManNo candidates for this brand. Empty until populated. */
  tecdocManNo: number[];
  /** DT100.ManCode, human-reference only — not used for matching. */
  tecdocManCode: string[];
  /** Anything non-obvious about this brand's mapping (regional variants, platform splits, etc). */
  note?: string;
}

// Keyed by YQ's vehicle.brand value exactly as returned by getVehicleInfo
// (uppercase). Source: POST /restApi/v2/catalogs, 57 catalogs / 56 unique
// brand values as of 2026-08-01.
export const TECDOC_BRAND_MAP: Record<string, TecDocBrandMapping> = {
  ABARTH: { tecdocManNo: [3854], tecdocManCode: ['ABARTH'] },
  'ALFA ROMEO': { tecdocManNo: [2], tecdocManCode: ['ALFA'] },
  AUDI: { tecdocManNo: [5], tecdocManCode: ['AUDI'] },
  BMW: { tecdocManNo: [16], tecdocManCode: ['BMW'] },
  // No dedicated "BMW Motorrad" row in DT100 (a "MOTORRAD" row exists,
  // ManNo 4670, but its Term doesn't even mention BMW and its PC/CV/LCV
  // flags look like a data quirk — not trustworthy). Per user: treat as
  // BMW's own manufacturer entry, motorcycle line.
  'BMW MOTORRAD': { tecdocManNo: [16], tecdocManCode: ['BMW'], note: 'Motorcycle line — TecDoc has no separate manufacturer row for it; same ManNo as BMW cars.' },
  BUICK: { tecdocManNo: [816], tecdocManCode: ['BUICK'] },
  CADILLAC: { tecdocManNo: [819], tecdocManCode: ['CADIL'] },
  CHEVROLET: { tecdocManNo: [138], tecdocManCode: ['CHEVR'] },
  CHRYSLER: { tecdocManNo: [20], tecdocManCode: ['CHRYS'] },
  // TecDoc's Term is "CITROËN" (with diaeresis) — a plain ASCII substring
  // match against "CITROEN" misses it, hence a direct ManNo instead.
  CITROEN: { tecdocManNo: [21], tecdocManCode: ['CITRO'], note: 'TecDoc term is "CITROËN" (diaeresis).' },
  DACIA: { tecdocManNo: [139], tecdocManCode: ['DACIA'] },
  DAEWOO: { tecdocManNo: [185], tecdocManCode: ['DAEWOO'] },
  DODGE: { tecdocManNo: [29], tecdocManCode: ['DODGE'] },
  DS: { tecdocManNo: [4468], tecdocManCode: ['DS'] },
  FIAT: { tecdocManNo: [35], tecdocManCode: ['FIAT'] },
  // No dedicated row either — per user, Fiat Professional (commercial/bus
  // line) shares FIAT's own manufacturer row, which does carry CV/LCV
  // flags alongside PC, consistent with covering both lines.
  'FIAT PROFESSIONAL': { tecdocManNo: [35], tecdocManCode: ['FIAT'], note: 'Commercial/bus line — same ManNo as FIAT passenger cars.' },
  FORD: { tecdocManNo: [36], tecdocManCode: ['FORD'] },
  GMC: { tecdocManNo: [39], tecdocManCode: ['GMC'] },
  HOLDEN: { tecdocManNo: [801], tecdocManCode: ['HOLDE'] },
  HONDA: { tecdocManNo: [45], tecdocManCode: ['HONDA'] },
  HUMMER: { tecdocManNo: [1506], tecdocManCode: ['HUMME'] },
  HYUNDAI: { tecdocManNo: [183], tecdocManCode: ['HYUNDAI'] },
  INFINITI: { tecdocManNo: [1526], tecdocManCode: ['INFIN'] },
  ISUZU: { tecdocManNo: [54], tecdocManCode: ['ISUZU'] },
  JAGUAR: { tecdocManNo: [56], tecdocManCode: ['JAGUA'] },
  JEEP: { tecdocManNo: [882], tecdocManCode: ['JEEP'] },
  KIA: { tecdocManNo: [184], tecdocManCode: ['KIA'] },
  LANCIA: { tecdocManNo: [64], tecdocManCode: ['LANCIA'] },
  'LAND ROVER': { tecdocManNo: [1820], tecdocManCode: ['LANDROVER'] },
  LEXUS: { tecdocManNo: [842], tecdocManCode: ['LEXUS'] },
  MAZDA: { tecdocManNo: [72], tecdocManCode: ['MAZDA'] },
  'MERCEDES-BENZ': { tecdocManNo: [74], tecdocManCode: ['MERCE'] },
  MINI: { tecdocManNo: [1523], tecdocManCode: ['MINI'] },
  MITSUBISHI: { tecdocManNo: [77], tecdocManCode: ['MITSUBISHI'] },
  NISSAN: { tecdocManNo: [80], tecdocManCode: ['NISSA'] },
  OLDSMOBILE: { tecdocManNo: [1141], tecdocManCode: ['OLDS'] },
  // Two YQ catalogs ("Opel" and "Opel (PSA)") both report brand "OPEL" —
  // only the GM-era ManNo is confirmed so far; the PSA-platform one is
  // still unresolved (deferred, per earlier discussion).
  OPEL: { tecdocManNo: [84], tecdocManCode: ['OPEL'], note: 'GM-era only so far. "Opel (PSA)" catalog (post-2017 PSA platforms) may need a second ManNo — not yet resolved.' },
  PEUGEOT: { tecdocManNo: [88], tecdocManCode: ['PEUGE'] },
  PONTIAC: { tecdocManNo: [774], tecdocManCode: ['PONTI'] },
  PORSCHE: { tecdocManNo: [92], tecdocManCode: ['PORSC'] },
  RAM: { tecdocManNo: [3689], tecdocManCode: ['RAM'] },
  RAVON: { tecdocManNo: [4660], tecdocManCode: ['RAVON'] },
  RENAULT: { tecdocManNo: [93], tecdocManCode: ['RENAU'] },
  'ROLLS-ROYCE': { tecdocManNo: [705], tecdocManCode: ['ROLLS'] },
  SAAB: { tecdocManNo: [99], tecdocManCode: ['SAAB'] },
  SATURN: { tecdocManNo: [1497], tecdocManCode: ['SATUR'] },
  SEAT: { tecdocManNo: [104], tecdocManCode: ['SEAT'] },
  SKODA: { tecdocManNo: [106], tecdocManCode: ['SKODA'] },
  SMART: { tecdocManNo: [1138], tecdocManCode: ['SMART'] },
  SSANGYONG: { tecdocManNo: [175], tecdocManCode: ['SSANG'] },
  SUBARU: { tecdocManNo: [107], tecdocManCode: ['SUBAR'] },
  SUZUKI: { tecdocManNo: [109], tecdocManCode: ['SUZUK'] },
  TOYOTA: { tecdocManNo: [111], tecdocManCode: ['TOYOT'] },
  VAUXHALL: { tecdocManNo: [117], tecdocManCode: ['VAUXH'] },
  // TecDoc's Term is just "VW", not "VOLKSWAGEN".
  VOLKSWAGEN: { tecdocManNo: [121], tecdocManCode: ['VW'], note: 'TecDoc term is "VW", not "VOLKSWAGEN".' },
  VOLVO: { tecdocManNo: [120], tecdocManCode: ['VOLVO'] },
};
