import type { ReactNode } from 'react';

// Wraps occurrences of any of `codes` in `text` with <mark>. Bounded by
// lookarounds (not \b) so a match doesn't get glued onto surrounding
// alphanumerics (e.g. "BKC" won't also match inside "BKCX") even when the
// code itself starts or ends with punctuation (e.g. "(DV5RC Euro 6.3)"),
// where \b would never fire since both sides are non-word characters.
export function highlightCodes(text: string, codes: string[] | undefined): ReactNode {
  if (!codes?.length || !text) return text;
  const pattern = new RegExp(
    `(?<![A-Za-z0-9_])(${codes.map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?![A-Za-z0-9_])`,
    'gi'
  );
  const parts = text.split(pattern);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark
        key={i}
        className="rounded bg-[rgba(247,196,0,0.45)] px-0.5 text-[medium] font-bold text-foreground dark:bg-yellow-500/40"
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}
