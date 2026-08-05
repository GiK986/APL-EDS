# TM1 Task Context — Design

**Goal:** Stop `tid` (TM1's per-task work id) from silently getting dropped by
internal navigation, which currently breaks the "don't re-redirect an already-checked
task" guard and sends users back into a vehicle's catalog when they deliberately
click "Начало" (Home) to return to the Brand Grid. Also remove the resulting
grid-then-redirect flash on `/`.

**Context:** Found while reviewing a screen recording of a real session. Sequence
observed: user on a vehicle's group tree clicks the "Начало" breadcrumb
(`href: '/'`) → lands on `/` with `tid` missing from the URL →
`Tm1VinAutoRedirect` (`src/components/tm1-vin-auto-redirect.tsx`) reads
`tid = null`, checks the wrong (un-namespaced) sessionStorage flag key, doesn't find
the real per-task flag already set under `apl-eds-tm1-vin-autocheck:<tid>`, treats
it as first-run, and re-fires — bouncing the user right back into the vehicle
catalog it was supposed to leave.

Root cause: `tid` is hand-threaded through `useSearchParams()` independently in
`route-persistence.tsx`, `tm1-vin-auto-redirect.tsx`, and 5 hardcoded
`{ href: '/' }` breadcrumb entries (`catalog/[brand]/page.tsx`,
`catalog/[brand]/groups/page.tsx`, `catalog/[brand]/groups/parts/page.tsx` ×2,
`vehicle-wizard.tsx`). Any of these forgetting to carry `tid` forward breaks the
others, since they all depend on agreeing on the same value.

Live-verified against TM1: `window.__NEXT_WORKTASKID__` on TM1's own top-level
window changes when switching TM1 task tabs, *without* recreating our iframe — each
task tab keeps its own live iframe instance. This confirms `tid` is TM1's stable,
persisted work-task id (reused when a closed task is reopened, never regenerated),
handed to us once via query string because cross-origin JS can't read
`window.parent.__NEXT_WORKTASKID__` directly. A "capture once at true mount, treat
as immutable for the life of this iframe instance" model is therefore both safe and
the only channel available — no live tid-change tracking is needed.

## Scope

**In:**
- `Tm1TaskProvider` (new `src/components/tm1-task-context.tsx`): a Context mounted
  in root layout that reads `tid` from `useSearchParams()` exactly once, on true
  mount (same ref-guard pattern as the existing `hasCheckedInitialLoad`), and holds
  it for the provider's lifetime. Exposes `useTm1TaskId(): string | null`.
- `Tm1Link` (same file or `src/components/tm1-link.tsx`): thin wrapper around
  `next/link` that appends the current `tid` (from context) to any relative
  `href` pointing at our own app. `Breadcrumb` (`src/components/catalog/breadcrumb.tsx`)
  renders its segment links through this instead of raw `next/link` — fixes all 5
  call sites in one place, and protects future breadcrumb entries for free.
- `route-persistence.tsx`: drop its own `searchParams.get('tid')` capture, use
  `useTm1TaskId()` instead. Keep only the "record every navigation" effect. Skip
  the write on the component's first render (the boot state) so the raw entry URL
  (`/?lid=32&token=Bearer+eyJ...`) is never persisted as a "last path" — only real
  in-app navigations are recorded. (Avoids ever replaying a possibly-expired
  Bearer token from a stale sessionStorage entry.)
- `tm1-vin-auto-redirect.tsx`: drop its own `searchParams.get('tid')` capture, use
  `useTm1TaskId()` instead, so the anti-repeat guard always checks the same
  namespaced flag key regardless of what the current URL happens to contain.
- `RouteRestoreGate` (new, used only in `src/app/page.tsx`): moves the
  restore-on-mount half of what `route-persistence.tsx` used to do, out of the
  global layout and into a component scoped to the Brand Grid page. Renders a
  loading spinner (`t('loading', lang)` / new `t('pleaseWait', lang)`) instead of
  the Brand Grid on first client render; only reveals the (already server-rendered)
  grid once it has confirmed there's nothing to restore. Because this is a Client
  Component whose initial state is `'checking'`, the *server-rendered* HTML is
  already the spinner — the grid never paints before the redirect decision is
  made, eliminating the current 2-3s grid-then-redirect flash (including on TM1
  tab-switch-and-back, which re-triggers this same flow).
- New i18n key `pleaseWait` (en: "Please wait", bg: "Моля, изчакайте"), used
  alongside the existing `loading` key.

**Out:**
- No change to how TM1 hands us `tid`/`lid`/the Bearer token on the entry URL —
  still query-string based, still one-shot at iframe creation.
- No attempt to detect a `tid` change mid-session (live tab-switch reuse) — not
  possible per the live-verified iframe-per-task model, so not designed for.
- No change to `tm1-bridge.ts` postMessage commands.
- `VinDeepLink`'s redirect target (`buildVehicleGroupsHref`) still doesn't carry
  `tid` forward — out of scope here since `RouteRestoreGate` reads `tid` from
  context, not from the URL, so this stops mattering for the bug this design fixes.

## Data flow

1. TM1 creates our iframe with `/?lid=...&token=Bearer...&tid=<WORKTASKID>`.
2. Root layout mounts → `Tm1TaskProvider` captures `tid` once → available via
   context for the rest of this iframe instance's life, survives all internal
   SPA navigation regardless of what any given URL's query string contains.
3. `RouteRestoreGate` (on `/` only) checks `sessionStorage['apl-eds:last-path:<tid>']`
   before revealing anything; if set and not `/`, shows the spinner and
   `router.replace`s to it instead of painting the grid.
4. `route-persistence.tsx`'s record effect writes `pathname+query` under the same
   namespaced key on every subsequent real navigation (not on first render).
5. `Tm1VinAutoRedirect` checks/sets `apl-eds-tm1-vin-autocheck:<tid>` using the
   same context `tid` — the guard now reliably recognizes an already-checked task
   no matter how the user got back to `/`.
6. Clicking "Начало" → `Tm1Link` resolves to `/?tid=<same-tid>` → guard finds the
   existing flag → does not re-fire → user reaches a clean Brand Grid.

## Error handling / edge cases

- `tid` absent entirely (local dev, direct non-TM1 access): `useTm1TaskId()`
  returns `null`; `Tm1Link` passes hrefs through unchanged; storage keys fall back
  to their current un-namespaced form — identical to today's behavior for this
  case, no regression.
- `sessionStorage` unavailable (partitioned/blocked third-party storage): existing
  try/catch-and-ignore pattern in `route-persistence.tsx` is kept as-is.
- `RouteRestoreGate` finding nothing to restore: reveals the grid immediately on
  the effect's first run — no artificial delay beyond one effect tick.

## Testing

Manual verification against the live TM1 embed (per project convention — no
automated test harness for TM1 iframe behavior exists): reproduce the exact
"Начало" scenario from the reviewed recording (vehicle attached to task → open OEM
Parts Catalog → navigate into a group → click "Начало") and confirm it now lands
directly on the Brand Grid without bouncing back into the vehicle catalog. Also
verify the spinner appears (not a grid flash) both on a fresh `/` load with a saved
last-path, and after switching TM1 task tabs away and back. `npm run check` must
stay green.
