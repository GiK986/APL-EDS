# Part Inquiry Panel (frame only) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dev-only, right-side sliding panel ("Sheet") that opens from a new icon
in each parts-table row and shows the clicked part's OE number/name — a frame to build
a future "request availability/price from an external service" feature inside, later.

**Architecture:** A new `Sheet` UI primitive (`src/components/ui/sheet.tsx`) mirrors the
existing `Dialog` primitive (`src/components/ui/dialog.tsx`) — same `@base-ui/react/dialog`
base, same `data-open`/`data-closed` + `tw-animate-css` animation convention — but
positioned as a right-edge drawer instead of a centered modal. `PartInquiryPanel`
(`src/components/catalog/part-inquiry-panel.tsx`) wraps it with static content (title +
selected part's OE number/name, no form yet). Deviation from the design spec: the spec
described state living in `PartsTable` with an `onInquire` callback threaded through
`UnitPanel` → `PartsSectionTable` → `PartRow`; mapping the file during planning showed
that's 3 levels of prop-drilling for no benefit, since only one panel is ever open at a
time and the row that opens it already has the `part` object. Instead, `PartRow` owns
its own `inquiryOpen` boolean locally (`useState`) — the same pattern the file already
uses for its `copied` state — and renders `PartInquiryPanel` itself. No other file needs
to know about it.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, `@base-ui/react`
Dialog primitive, Tailwind CSS v4, `tw-animate-css`, lucide-react.

## Global Constraints

- TypeScript strict mode, no `any` — matches `AGENTS.md`.
- `ui/` primitives use the shadcn convention already established by `dialog.tsx` and
  `button.tsx`: double-quoted strings, no semicolons. The rest of the codebase (`.tsx`
  files under `components/catalog/`, `lib/`) uses single quotes + semicolons — match
  whichever convention the file you're editing already uses.
- All user-facing copy goes through `t(key, lang)` from `src/lib/i18n.ts` — never a
  hardcoded string in JSX. Every key needs both an `en` and a `bg` entry.
- The new trigger icon must be gated by `process.env.NODE_ENV !== 'production'` — it
  must not render in a production build. This is a separate, independent condition
  from the existing `isTm1Embedded` gate used by the OE-aftermarket icon next to it.
- No test framework exists in this repo (`package.json` has no `test` script, no
  jest/vitest/playwright dependency) — verification is `npm run check` (lint +
  typecheck + build) plus manual confirmation in `npm run dev`, per the approved
  design spec's Testing section.

---

## Task 1: Sheet UI primitive

**Files:**
- Create: `src/components/ui/sheet.tsx`

**Interfaces:**
- Consumes: `cn` from `@/lib/utils`, `Button` from `@/components/ui/button`, `XIcon`
  from `lucide-react`, `Dialog` from `@base-ui/react/dialog` (aliased `SheetPrimitive`,
  confirmed API: `Root` accepts `open?: boolean`, `onOpenChange?: (open: boolean, ...) => void`
  — see `node_modules/@base-ui/react/dialog/root/DialogRoot.d.ts`).
- Produces: `Sheet`, `SheetClose`, `SheetContent`, `SheetHeader`, `SheetOverlay`,
  `SheetPortal`, `SheetTitle` — named exports, used by Task 3.

- [ ] **Step 1: Create the file**

```tsx
"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

function Sheet({ ...props }: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: SheetPrimitive.Popup.Props & {
  showCloseButton?: boolean
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-sm flex-col gap-4 border-l border-border bg-popover p-4 text-sm text-popover-foreground shadow-lg outline-none duration-200 data-open:animate-in data-open:slide-in-from-right data-closed:animate-out data-closed:slide-out-to-right",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-2 right-2"
                size="icon-sm"
              />
            }
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1 pr-8", className)}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("font-heading text-base leading-none font-medium", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/sheet.tsx
git commit -m "Add right-side Sheet UI primitive"
```

---

## Task 2: i18n keys

**Files:**
- Modify: `src/lib/i18n.ts:76` (en block) and `src/lib/i18n.ts:154` (bg block) — line
  numbers as of this plan; search for the anchor text below if they've drifted.

**Interfaces:**
- Produces: two new `TranslationKey` values — `inquireOemPart`, `oemInquiryTitle` —
  consumed by Task 3 and Task 4 via `t(key, lang)`.

- [ ] **Step 1: Add the English entries**

In the `en` block, find:

```ts
    searchOeAftermarket: 'Search aftermarket alternatives',
```

Replace with:

```ts
    searchOeAftermarket: 'Search aftermarket alternatives',
    inquireOemPart: 'Request original part availability',
    oemInquiryTitle: 'Original part inquiry',
```

- [ ] **Step 2: Add the Bulgarian entries**

In the `bg` block, find:

```ts
    searchOeAftermarket: 'Търсене на алтернативи',
```

Replace with:

```ts
    searchOeAftermarket: 'Търсене на алтернативи',
    inquireOemPart: 'Запитване за наличност на оригинал',
    oemInquiryTitle: 'Запитване за оригинална част',
```

- [ ] **Step 3: Verify it compiles**

Run: `npm run typecheck`
Expected: no errors (both blocks must have matching keys or `TranslationKey`/runtime
lookups mismatch — `TranslationKey` is inferred from the `en` block only, so a missing
`bg` entry won't fail typecheck, it'll return `undefined` at runtime; double-check both
edits landed).

- [ ] **Step 4: Commit**

```bash
git add src/lib/i18n.ts
git commit -m "Add i18n keys for the OEM part inquiry trigger and panel"
```

---

## Task 3: PartInquiryPanel component

**Files:**
- Create: `src/components/catalog/part-inquiry-panel.tsx`

**Interfaces:**
- Consumes: `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle` from
  `@/components/ui/sheet` (Task 1); `t`, `type Lang` from `@/lib/i18n` (Task 2 keys:
  `oemInquiryTitle`); `type PartV2Dto` from `@/types/yq` (fields used:
  `partNumber: string`, `partNumberFormatted?: string`, `partName?: string`,
  `displayName?: string`).
- Produces: `PartInquiryPanel({ part, onClose, lang }: { part: PartV2Dto | null; onClose: () => void; lang: Lang })`
  — named export, consumed by Task 4.

- [ ] **Step 1: Create the file**

```tsx
'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { PartV2Dto } from '@/types/yq';
import { t, type Lang } from '@/lib/i18n';

interface PartInquiryPanelProps {
  part: PartV2Dto | null;
  onClose: () => void;
  lang: Lang;
}

export function PartInquiryPanel({ part, onClose, lang }: PartInquiryPanelProps) {
  return (
    <Sheet open={!!part} onOpenChange={(open) => !open && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t('oemInquiryTitle', lang)}</SheetTitle>
        </SheetHeader>
        {part && (
          <div className="text-sm">
            <div className="font-mono font-medium">
              {part.partNumberFormatted ?? part.partNumber}
            </div>
            <div className="text-muted-foreground">{part.displayName || part.partName}</div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/catalog/part-inquiry-panel.tsx
git commit -m "Add PartInquiryPanel frame component"
```

---

## Task 4: Wire the trigger into PartRow

**Files:**
- Modify: `src/components/parts-table.tsx` (import block, and the `PartRow` function
  currently at lines 663-753)

**Interfaces:**
- Consumes: `PartInquiryPanel` from `@/components/catalog/part-inquiry-panel` (Task 3);
  `PackageSearch` icon from `lucide-react`; `t('inquireOemPart', lang)` (Task 2).

- [ ] **Step 1: Add the new icon import**

Find:

```ts
import { ArrowLeft, Check, Copy, Layers, Loader2, Minus, Plus, RotateCcw, Search } from 'lucide-react';
```

Replace with:

```ts
import { ArrowLeft, Check, Copy, Layers, Loader2, Minus, PackageSearch, Plus, RotateCcw, Search } from 'lucide-react';
```

- [ ] **Step 2: Add the PartInquiryPanel import**

Find:

```ts
import { highlightCodes } from '@/components/highlight-codes';
```

Replace with:

```ts
import { highlightCodes } from '@/components/highlight-codes';
import { PartInquiryPanel } from '@/components/catalog/part-inquiry-panel';
```

- [ ] **Step 3: Add local state and the handler**

Find:

```tsx
  const [copied, setCopied] = useState(false);
  const isTm1Embedded = useIsTm1Embedded();

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    await navigator.clipboard.writeText(part.partNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleSearchOeAftermarket(e: React.MouseEvent) {
    e.stopPropagation();
    openOeAftermarket(part.partNumber);
  }
```

Replace with:

```tsx
  const [copied, setCopied] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const isTm1Embedded = useIsTm1Embedded();

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    await navigator.clipboard.writeText(part.partNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleSearchOeAftermarket(e: React.MouseEvent) {
    e.stopPropagation();
    openOeAftermarket(part.partNumber);
  }

  function handleInquire(e: React.MouseEvent) {
    e.stopPropagation();
    setInquiryOpen(true);
  }
```

- [ ] **Step 4: Wrap the return in a Fragment, add the trigger icon, render the panel**

This is one atomic replacement of the entire `return (...)` block (the current file's
exact text, from `return (` through the function's closing `}`).

Find:

```tsx
  return (
    <tr
      ref={(el) => registerRowRef(part.areaCode, el)}
      onMouseEnter={() => part.areaCode && onHover(part.areaCode)}
      onMouseLeave={() => onHover(null)}
      onClick={onClick}
      className={cn(
        'cursor-pointer transition-colors hover:bg-muted/40',
        part.matched && 'bg-primary/5',
        isActive && 'bg-primary/15'
      )}
    >
      <td className="px-3 py-2 text-center text-sm text-muted-foreground">{part.areaCode}</td>
      <td className="px-3 py-2 font-mono text-sm font-medium">
        <span className="inline-flex items-center gap-1.5">
          {part.partNumberFormatted ?? part.partNumber}
          {part.partNumber && !isTm1Embedded && (
            <button
              type="button"
              onClick={handleCopy}
              aria-label={t('copyPartNumber', lang)}
              title={copied ? t('copiedPartNumber', lang) : t('copyPartNumber', lang)}
              className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </button>
          )}
          {part.partNumber && isTm1Embedded && (
            <button
              type="button"
              onClick={handleSearchOeAftermarket}
              aria-label={t('searchOeAftermarket', lang)}
              title={t('searchOeAftermarket', lang)}
              className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Search className="h-4 w-4" />
            </button>
          )}
        </span>
      </td>
      <td className="px-3 py-2">
        <div className="font-medium">{cleanText(part.displayName || part.partName)}</div>
        {part.displayName && part.partName !== part.displayName && (
          <div className="text-sm text-muted-foreground">{cleanText(part.partName)}</div>
        )}
      </td>
      {showQty && (
        <td className="px-3 py-2 text-center text-sm">{part.qty?.note ?? part.qty?.qty ?? '—'}</td>
      )}
      {columns.map((col) => {
        const lines = attrCellLines(part.attributes, col.code).map(cleanText);
        return (
          <td
            key={col.code}
            className="px-3 py-2 text-sm text-muted-foreground hidden lg:table-cell"
          >
            {lines.length
              ? lines.map((line, i) => <div key={i}>{highlightCodes(line, matchCodes)}</div>)
              : '—'}
          </td>
        );
      })}
    </tr>
  );
}
```

Replace with:

```tsx
  return (
    <>
      <tr
        ref={(el) => registerRowRef(part.areaCode, el)}
        onMouseEnter={() => part.areaCode && onHover(part.areaCode)}
        onMouseLeave={() => onHover(null)}
        onClick={onClick}
        className={cn(
          'cursor-pointer transition-colors hover:bg-muted/40',
          part.matched && 'bg-primary/5',
          isActive && 'bg-primary/15'
        )}
      >
        <td className="px-3 py-2 text-center text-sm text-muted-foreground">{part.areaCode}</td>
        <td className="px-3 py-2 font-mono text-sm font-medium">
          <span className="inline-flex items-center gap-1.5">
            {part.partNumberFormatted ?? part.partNumber}
            {part.partNumber && !isTm1Embedded && (
              <button
                type="button"
                onClick={handleCopy}
                aria-label={t('copyPartNumber', lang)}
                title={copied ? t('copiedPartNumber', lang) : t('copyPartNumber', lang)}
                className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </button>
            )}
            {part.partNumber && isTm1Embedded && (
              <button
                type="button"
                onClick={handleSearchOeAftermarket}
                aria-label={t('searchOeAftermarket', lang)}
                title={t('searchOeAftermarket', lang)}
                className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Search className="h-4 w-4" />
              </button>
            )}
            {part.partNumber && process.env.NODE_ENV !== 'production' && (
              <button
                type="button"
                onClick={handleInquire}
                aria-label={t('inquireOemPart', lang)}
                title={t('inquireOemPart', lang)}
                className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <PackageSearch className="h-4 w-4" />
              </button>
            )}
          </span>
        </td>
        <td className="px-3 py-2">
          <div className="font-medium">{cleanText(part.displayName || part.partName)}</div>
          {part.displayName && part.partName !== part.displayName && (
            <div className="text-sm text-muted-foreground">{cleanText(part.partName)}</div>
          )}
        </td>
        {showQty && (
          <td className="px-3 py-2 text-center text-sm">{part.qty?.note ?? part.qty?.qty ?? '—'}</td>
        )}
        {columns.map((col) => {
          const lines = attrCellLines(part.attributes, col.code).map(cleanText);
          return (
            <td
              key={col.code}
              className="px-3 py-2 text-sm text-muted-foreground hidden lg:table-cell"
            >
              {lines.length
                ? lines.map((line, i) => <div key={i}>{highlightCodes(line, matchCodes)}</div>)
                : '—'}
            </td>
          );
        })}
      </tr>
      <PartInquiryPanel
        part={inquiryOpen ? part : null}
        onClose={() => setInquiryOpen(false)}
        lang={lang}
      />
    </>
  );
}
```

- [ ] **Step 5: Run full verification**

Run: `npm run check`
Expected: lint, typecheck, and build all pass with no errors.

- [ ] **Step 6: Manual visual check**

Run: `npm run dev`, open a brand → pick a vehicle → drill into a parts list. Confirm:
- The new icon (distinct from the existing `Search` OE-aftermarket icon) appears next
  to the part number.
- Clicking it slides a panel in from the right edge of the screen, showing the title
  and the clicked part's OE number/name.
- The close button (top-right of the panel) closes it.
- Run `npm run build` once more (already covered by `npm run check` in Step 5) and
  confirm the icon is controlled by `NODE_ENV` — no further action needed since
  `next build` sets `NODE_ENV=production`, which the conditional already excludes.

- [ ] **Step 7: Commit**

```bash
git add src/components/parts-table.tsx
git commit -m "Add dev-only trigger for the part inquiry panel"
```
