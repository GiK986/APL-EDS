import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// YQ API text fields (unit/group/part names) sometimes concatenate
// multiple source segments with runs of literal whitespace left in place
// (e.g. "engine oil                        Observe   maintenance manual:").
// Collapse those runs to single spaces for display.
export function cleanText(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}
