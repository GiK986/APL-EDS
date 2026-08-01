// Per-brand overrides for TecDoc K-Type matching behavior. No single
// generic algorithm covers every brand YQ reports on — built incrementally,
// one brand/case verified against live data at a time, same as
// tecdoc-brand-map.ts. Brands absent here fall back to the generic
// defaults in vehicle-codes.ts, never a guessed rule.
export interface VehicleExtractionRules {
  /** Whether to also try a shorter "stem" (letters + digit-run prefix)
   * candidate alongside the clean engine code when searching TecDoc.
   * Default true — safe over-inclusion; TecDoc's own formatting sometimes
   * doesn't literally match YQ's code (e.g. BMW's YQ "B38N" vs TecDoc's
   * "B38 A15 M"), and the stem is what lets those still surface at all.
   * Set false where it's been shown to hurt precision instead — the stem
   * matches too broadly and pulls in unrelated models sharing the same
   * engine family prefix. */
  useEngineCodeStems?: boolean;
  note?: string;
}

// Brands that share the same manufacturer engineering conventions can
// share one rule set instead of duplicating it per brand.
export const BRAND_GROUPS: Record<string, string[]> = {
  VAG: ['VOLKSWAGEN', 'AUDI', 'SEAT', 'SKODA'],
};

// Keyed by brand name or a BRAND_GROUPS key. A brand-level entry (if
// present) wins over its group's.
export const VEHICLE_EXTRACTION_RULES: Record<string, VehicleExtractionRules> = {
  VAG: {
    useEngineCodeStems: false,
    note: 'VW and Audi both confirmed with exact-matching codes (CHYB, BKC/BLS/BXE) — live-verified. Seat/Škoda grouped in by inference (same platform engineering), not individually verified yet.',
  },
  BMW: {
    useEngineCodeStems: true,
    note: "YQ's engine code suffix letter (e.g. B38N) often doesn't match TecDoc's own suffix (B38 A15 M) — live-verified, needs the stem.",
  },
  HONDA: {
    useEngineCodeStems: false,
    note: 'K20 family: stemming "K20A4" down to "K20" pulled in every other K20-engined model (Civic, Stream, Integra) as false positives — live-verified.',
  },
};

export function resolveExtractionRules(brand: string): VehicleExtractionRules {
  const b = brand.toUpperCase();
  if (VEHICLE_EXTRACTION_RULES[b]) return VEHICLE_EXTRACTION_RULES[b];
  const group = Object.entries(BRAND_GROUPS).find(([, brands]) => brands.includes(b))?.[0];
  if (group) return VEHICLE_EXTRACTION_RULES[group] ?? {};
  return {};
}
