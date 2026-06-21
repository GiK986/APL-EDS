import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// YQ API text fields (unit/group/part names) sometimes concatenate
// multiple source segments with runs of literal whitespace left in place
// (e.g. "engine oil                        Observe   maintenance manual:").
// Collapse those runs to single spaces for display.
export function cleanText(value: string | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim()
}

// Some catalogs (e.g. VAG) pack the unit "note" attribute as ';'-separated
// sub-fields, with a stray run of ';' marking an intentionally blank field
// (e.g. "oil pump;1.5ltr.;Otto engine+, oil filter;;DUCA,DUCB"). Collapse
// those runs to a single separator and render it as " | " instead.
export function formatNoteValue(value: string): string {
  return value.replace(/;{2,}/g, ';').replace(/;/g, ' | ')
}
