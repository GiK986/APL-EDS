'use server';

import { getTecDocPool } from '@/lib/tecdoc-db';
import { TECDOC_BRAND_MAP } from '@/lib/tecdoc-brand-map';

export interface TecDocMatch {
  ktypNo: number;
  modelSeriesText: string;
  typeText: string;
  engineCodes: string[];
  modYFrom: number;
  modYTo: number;
  kw: number;
  hp: number;
  ccm: number;
  cyl: number;
  fuelType: string;
  score: number;
}

interface FindTecDocMatchesInput {
  brand: string;
  model?: string;
  engineCodeCandidates: string[];
  vehicleYearMonth?: number;
  kw?: number;
  hp?: number;
}

// A handful of brands where YQ's full name doesn't resemble TecDoc's
// DT100.ManCode (nvarchar(10) — long names get silently truncated at
// import, e.g. "MERCEDES-BENZ" -> "MERCE"). Extend as new mismatches turn up.
const BRAND_ALIASES: Record<string, string> = {
  VOLKSWAGEN: 'VW',
  'MERCEDES-BENZ': 'MERCE',
  'MERCEDES BENZ': 'MERCE',
};

// DT120.FuelType (key table 182) — this snapshot's DT012 doesn't carry
// resolved text for key-table entries (only for the "named entity" tables
// like manufacturer/model/type), so these are hand-verified against our own
// data instead: 1/2 confirmed by cross-checking known petrol/diesel engine
// codes (e.g. Peugeot's DV5RC HDi -> FuelType 2), 11 confirmed directly from
// the TecDoc-Data-Format doc's "TecDoc E-PC" (electric) linkage rule. Left
// blank for any other code rather than guess — wrong is worse than missing.
const FUEL_TYPE_TEXT: Record<number, string> = {
  1: 'Petrol',
  2: 'Diesel',
  11: 'Electric',
};

function normalizeCode(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function brandMatches(vehicleBrand: string, manCode: string): boolean {
  const brand = normalizeCode(BRAND_ALIASES[vehicleBrand.toUpperCase()] ?? vehicleBrand);
  const code = normalizeCode(manCode);
  if (!brand || !code) return false;
  return brand.includes(code) || code.includes(brand);
}

// Precise DT100.ManNo match via TECDOC_BRAND_MAP — unlike brandMatches
// (fuzzy ManCode substring, unreliable for closely-related manufacturer
// rows), this is exact-or-nothing. Matters most for badge-engineered
// platform siblings sharing identical specs, e.g. VW up! vs Škoda Citigo
// vs Seat Mii: their ManNo (121/106/104) are unambiguous even though a
// substring match on ManCode alone can't fully separate them.
function brandManNoMatches(vehicleBrand: string, manNo: number): boolean {
  const mapping = TECDOC_BRAND_MAP[vehicleBrand.toUpperCase()];
  return mapping ? mapping.tecdocManNo.includes(manNo) : false;
}

// YQ's vehicle.model (e.g. "CR-V") against TecDoc's own model series text
// (e.g. "CR-V II (RD_)") — a signal we weren't using at all before, and one
// that matters most exactly when engine code + date + brand all tie (e.g.
// Honda's K20 engine family shared across CR-V/Civic/Stream/Integra, none
// of which reliably report kW/HP for YQ to disambiguate with otherwise).
function modelMatches(vehicleModel: string | undefined, modelSeriesText: string): boolean {
  if (!vehicleModel) return false;
  const vm = normalizeCode(vehicleModel);
  const ts = normalizeCode(modelSeriesText);
  if (!vm || !ts) return false;
  return ts.includes(vm) || vm.includes(ts);
}

function dateWithinRange(vehicleYearMonth: number, modYFrom: number, modYTo: number): 'exact' | 'close' | 'no' {
  const from = modYFrom || 0;
  const to = modYTo || 999999;
  if (vehicleYearMonth >= from && vehicleYearMonth <= to) return 'exact';
  const oneYear = 100;
  if (vehicleYearMonth >= from - oneYear && vehicleYearMonth <= to + oneYear) return 'close';
  return 'no';
}

interface TecDocRow {
  KTypNo: number;
  ModelSeriesCTermNo: number;
  TypeCTermNo: number;
  ModYFrom: number;
  ModYTo: number;
  KW: number;
  HP: number;
  ccmTech: number;
  Cyl: number;
  FuelType: number;
  ManNo: number;
  ManCode: string;
}

// Finds candidate TecDoc K-Types for a YQ-identified vehicle. Deliberately
// permissive on the SQL side (normalized substring match on engine code,
// no hard brand filter) — precision comes from scoring every candidate on
// multiple signals afterwards, not from narrowing the WHERE clause, because
// none of the individual TecDoc fields (EngCode formatting, ManCode length)
// are reliable enough on their own across brands. See the plan doc for the
// live-tested VW/Mercedes/BMW/Peugeot cases this is built against.
export async function findTecDocMatches({
  brand,
  model,
  engineCodeCandidates,
  vehicleYearMonth,
  kw,
  hp,
}: FindTecDocMatchesInput): Promise<TecDocMatch[]> {
  if (engineCodeCandidates.length === 0) return [];

  const pool = await getTecDocPool();
  const rowsByCandidate = await Promise.all(
    engineCodeCandidates.map(async (candidate) => {
      const request = pool.request();
      request.input('pattern', `%${normalizeCode(candidate)}%`);
      const result = await request.query<TecDocRow>(`
        SELECT DISTINCT v.KTypNo, ms.CTermNo AS ModelSeriesCTermNo, v.CTermNo AS TypeCTermNo,
          v.ModYFrom, v.ModYTo, v.KW, v.HP, v.ccmTech, v.Cyl, v.FuelType, m.ManNo, m.ManCode
        FROM [DT155 Engines] e
        JOIN [DT125 Engine Number Allocation to Vehicle Types] r ON r.EngNo = e.EngNo
        JOIN [DT120 Vehicle Types] v ON v.KTypNo = r.KTypNo
        JOIN [DT110 Vehicle Model Series] ms ON ms.KModNo = v.KModNo
        JOIN [DT100 Manufacturer] m ON m.ManNo = ms.ManNo
        WHERE REPLACE(REPLACE(REPLACE(UPPER(e.EngCode),' ',''),'.',''),'-','') LIKE @pattern
          AND v.[Delete] = 0
      `);
      return result.recordset;
    })
  );

  const byKTypNo = new Map<number, TecDocRow>();
  for (const row of rowsByCandidate.flat()) {
    if (!byKTypNo.has(row.KTypNo)) byKTypNo.set(row.KTypNo, row);
  }
  if (byKTypNo.size === 0) return [];

  const ktypNos = Array.from(byKTypNo.keys());

  const cTermNos = Array.from(
    new Set(Array.from(byKTypNo.values()).flatMap((r) => [r.ModelSeriesCTermNo, r.TypeCTermNo]))
  );
  const termRequest = pool.request();
  const termParams = cTermNos.map((id, i) => {
    termRequest.input(`t${i}`, id);
    return `@t${i}`;
  });
  const termResult = await termRequest.query<{ CTermNo: number; Term: string }>(`
    SELECT CTermNo, MIN(Term) AS Term
    FROM [DT012 Country and Language-dependent Descriptions]
    WHERE CTermNo IN (${termParams.join(',')})
    GROUP BY CTermNo
  `);
  const termByCTermNo = new Map(termResult.recordset.map((r) => [r.CTermNo, r.Term]));

  // All engine codes tied to each matched KTypNo (not just the candidate we
  // happened to search by) — TM1's own TecDoc view shows the full list too
  // (e.g. "AUA, BBY" for a K-Type shared by two engine variants).
  const engRequest = pool.request();
  const engParams = ktypNos.map((id, i) => {
    engRequest.input(`k${i}`, id);
    return `@k${i}`;
  });
  const engResult = await engRequest.query<{ KTypNo: number; EngCode: string }>(`
    SELECT r.KTypNo, e.EngCode
    FROM [DT125 Engine Number Allocation to Vehicle Types] r
    JOIN [DT155 Engines] e ON e.EngNo = r.EngNo
    WHERE r.KTypNo IN (${engParams.join(',')})
  `);
  const engineCodesByKTypNo = new Map<number, string[]>();
  for (const row of engResult.recordset) {
    const list = engineCodesByKTypNo.get(row.KTypNo) ?? [];
    const code = row.EngCode.trim();
    if (!list.includes(code)) list.push(code);
    engineCodesByKTypNo.set(row.KTypNo, list);
  }

  const scored = Array.from(byKTypNo.values()).map((row) => {
    let score = 0;
    if (vehicleYearMonth) {
      const range = dateWithinRange(vehicleYearMonth, row.ModYFrom, row.ModYTo);
      if (range === 'exact') score += 5;
      else if (range === 'close') score += 1;
    }
    if (kw && row.KW && Math.abs(kw - row.KW) <= 3) score += 3;
    if (hp && row.HP && Math.abs(hp - row.HP) <= 5) score += 2;
    // Precise ManNo match beats the fuzzy ManCode fallback — needs to be
    // enough on its own to beat badge-engineered platform siblings with
    // identical specs (e.g. VW up! vs Škoda Citigo vs Seat Mii all share
    // the same engine, date range, kW and HP).
    if (brandManNoMatches(brand, row.ManNo)) score += 6;
    else if (brandMatches(brand, row.ManCode)) score += 4;
    if (modelMatches(model, termByCTermNo.get(row.ModelSeriesCTermNo) ?? '')) score += 3;

    return { row, score };
  });

  // Engine codes are frequently shared across an entire platform group
  // (e.g. VAG's BKC/BLS/BXE 1.9 TDI turns up under Audi, VW, Seat and
  // Škoda alike), so the unfiltered candidate set routinely mixes brands.
  // Once we have a *confirmed* ManNo for this brand, drop anything that
  // doesn't match it outright — no reason to show a VW Golf next to an
  // Audi A3 when we know for certain which brand the vehicle actually is.
  // Falls back to the unfiltered set if that would leave nothing, so an
  // unmapped/incomplete TECDOC_BRAND_MAP entry (e.g. the still-unresolved
  // "Opel (PSA)" case) degrades to the old permissive behavior instead of
  // silently returning zero results.
  const brandManNos = TECDOC_BRAND_MAP[brand.toUpperCase()]?.tecdocManNo ?? [];
  const brandFiltered =
    brandManNos.length > 0 ? scored.filter((s) => brandManNos.includes(s.row.ManNo)) : [];
  const candidates = brandFiltered.length > 0 ? brandFiltered : scored;

  const matches: TecDocMatch[] = candidates.map(({ row, score }) => ({
    ktypNo: row.KTypNo,
    modelSeriesText: termByCTermNo.get(row.ModelSeriesCTermNo) ?? '',
    typeText: termByCTermNo.get(row.TypeCTermNo) ?? '',
    engineCodes: engineCodesByKTypNo.get(row.KTypNo) ?? [],
    modYFrom: row.ModYFrom,
    modYTo: row.ModYTo,
    kw: row.KW,
    hp: row.HP,
    ccm: row.ccmTech,
    cyl: row.Cyl,
    fuelType: FUEL_TYPE_TEXT[row.FuelType] ?? '',
    score,
  }));

  return matches.sort((a, b) => b.score - a.score).slice(0, 5);
}
