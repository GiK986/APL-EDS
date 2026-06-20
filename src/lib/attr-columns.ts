import type { AttrNodeV2 } from '@/types/yq';

export interface AttrColumn {
  code: string;
  label: string;
}

// Columns are not fixed: each brand/catalog exposes a different set of
// attributes (e.g. VW: Quantity/Note, Opel: gm_part_number/Range), so the
// column set is derived from whatever labels are actually present on the
// given items, instead of being hardcoded per brand.
export function computeAttrColumns(
  items: Array<{ attributes?: AttrNodeV2[] }>,
  excludeCodes: string[] = ['GROUP', 'YEAR_RANGE']
): AttrColumn[] {
  const columns = new Map<string, string>();
  for (const item of items) {
    for (const attr of item.attributes ?? []) {
      if (excludeCodes.includes(attr.code)) continue;
      if (!columns.has(attr.code)) columns.set(attr.code, attr.label);
    }
  }
  return Array.from(columns, ([code, label]) => ({ code, label }));
}

// "Note" and "Options" values encode multiple sub-fields joined with ';'
// (e.g. "door;left" or "rear view mirror housing;left;PR:6XN+7Y8+"), so each
// segment renders on its own line. Other attributes (e.g. BMW's
// associated_parts) use ';' as ordinary punctuation inside prose, so only
// these two codes are split this way.
const MULTI_VALUE_CODES = ['note', 'options'];

export function attrCellLines(attributes: AttrNodeV2[] | undefined, code: string): string[] {
  const matches = attributes?.filter((a) => a.code === code) ?? [];
  return matches.flatMap((attr) =>
    attr.values.flatMap((v) =>
      MULTI_VALUE_CODES.includes(code)
        ? v
            .split(';')
            .map((s) => s.trim())
            .filter(Boolean)
        : [v]
    )
  );
}
