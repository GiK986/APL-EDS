# Part Inquiry Panel (frame only) — Design

**Goal:** Scaffold a dev-only, right-side sliding panel triggered from a part row, so
future work (an internal "request availability/price for this OEM part from an
external service" feature) has a shell to build inside. This phase ships only the
frame — no form, no request logic, no external service call.

**Context:** `openOeAftermarket()` in `src/lib/tm1-bridge.ts` already opens *TM1's own*
native OE-aftermarket search modal via `postMessage`, triggered by the `Search` icon
next to the part number in `PartRow` (`src/components/parts-table.tsx`), visible only
when `isTm1Embedded`. This is a separate, unrelated feature: a panel of *our own*,
for a future inquiry mechanism against an external service (not TM1, not aftermarket).
Visually inspired by TM1's slide-in "Каталог" modal, but only the container — none of
its filter/options chrome is being cloned in this phase.

## Scope

**In:**
- A reusable `Sheet` UI primitive (`src/components/ui/sheet.tsx`) — right-side sliding
  variant of the existing `Dialog` primitive (`src/components/ui/dialog.tsx`), same
  `@base-ui/react/dialog` base, same `data-open`/`data-closed` + `tw-animate-css`
  animation convention, just positioned `fixed right-0 top-0 h-full` and sliding
  in/out from the right instead of fading+zooming from center.
- `PartInquiryPanel` (`src/components/catalog/part-inquiry-panel.tsx`) — renders the
  Sheet with a header ("Запитване за оригинална част") and the selected part's OE
  number + name in the body. Close button only (from the Sheet primitive). No form,
  no filters, no fetch.
- A new trigger icon (`PackageSearch` from lucide) in `PartRow`, next to the existing
  `Search` (OE aftermarket) icon, gated by `process.env.NODE_ENV !== 'production'`
  (dev-only — separate gate from `isTm1Embedded`).
- State lives in `PartsTable`: `selectedInquiryPart: PartV2Dto | null`, passed down to
  `PartRow` as an `onInquire` callback, panel rendered once at table level.

**Out (future work, explicitly not this phase):**
- The actual inquiry form and its fields.
- Any external service integration or Server Action.
- Result list / pricing / availability display.
- Any TM1-filter-chrome cloning (options bar, "Разширен асортимент", stock filter).
- Production visibility — this ships dev-only; before going to production the trigger
  gets commented out (per user's explicit plan) until the feature is complete.

## Data flow

1. User clicks the new icon in a `PartRow` → calls `onInquire(part)`.
2. `PartsTable` sets `selectedInquiryPart = part`.
3. `PartInquiryPanel` receives `part={selectedInquiryPart}`, treats non-null as "open".
4. Close (X button or overlay/escape, per Base UI Dialog defaults) → `onClose` → parent
   sets `selectedInquiryPart = null`.

## Error handling / edge cases

None beyond what the Sheet/Dialog primitive already handles (escape key, overlay
click, focus trap) — there's no async work in this phase to fail.

## Testing

Manual verification only: `npm run dev`, open a brand → vehicle → parts list, confirm
the new icon appears (dev only), click it, confirm the panel slides in from the right
with the clicked part's OE number/name, close works via the X button. `npm run check`
must stay green.
