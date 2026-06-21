import type { ReactNode } from 'react';

// Wraps occurrences of any of `codes` in `text` with <mark>. Word-bounded
// and case-insensitive so e.g. "BKC" doesn't also match inside "BKCX".
export function highlightCodes(text: string, codes: string[] | undefined): ReactNode {
  if (!codes?.length || !text) return text;
  const pattern = new RegExp(
    `\\b(${codes.map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
    'gi'
  );
  const parts = text.split(pattern);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="rounded bg-yellow-200 px-0.5 text-foreground dark:bg-yellow-500/40">
        {part}
      </mark>
    ) : (
      part
    )
  );
}
