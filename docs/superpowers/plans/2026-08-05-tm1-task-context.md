# TM1 Task Context Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Capture TM1's per-task `tid` once, in a single Context, so internal
navigation (specifically the "Начало" breadcrumb) can never drop it and break the
"don't re-check an already-checked task" guard — plus replace the Brand Grid's
grid-then-redirect flash with a spinner while a saved last-path is restored.

**Architecture:** A `Tm1TaskProvider` React Context, mounted once in root layout,
captures `tid` from `useSearchParams()` on this iframe instance's true first render
and freezes it for the provider's lifetime (safe because TM1 gives every task its
own fresh iframe — live-verified against `window.__NEXT_WORKTASKID__`, see spec).
`route-persistence.tsx` and `tm1-vin-auto-redirect.tsx` read `tid` from this context
instead of independently re-parsing `useSearchParams()`. A `Tm1Link` wrapper around
`next/link`, used inside `breadcrumb.tsx`, appends the context `tid` to internal
hrefs automatically. A new `RouteRestoreGate` client component, used only on the
Brand Grid page, shows a spinner instead of painting the grid until it has checked
(and acted on) sessionStorage's saved last-path.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4,
lucide-react icons. No test framework in this repo — verification is
`npm run check` (lint + typecheck + build) plus manual browser checks against the
live TM1 embed, matching this project's existing convention (see
`docs/superpowers/specs/2026-07-22-part-inquiry-panel-design.md`).

## Global Constraints

- TypeScript strict mode, no `any`.
- Named exports, PascalCase components, camelCase utils.
- Tailwind utility classes only, no inline styles.
- 2-space indentation.
- No comments unless the WHY is non-obvious (hidden constraint, subtle invariant) —
  this codebase already follows that discipline; match it.
- `?? []` / try-catch defensive guards belong at API/storage boundaries, not
  sprinkled everywhere.
- Code and comments in English (project convention, regardless of UI language).
- No automated test suite exists — every task's "test" step is `npm run typecheck`
  for fast feedback; the final task runs full `npm run check` plus a live manual
  check against TM1.

---

### Task 1: Shared TM1 session-key helper

**Files:**
- Create: `src/lib/tm1-session-key.ts`

**Interfaces:**
- Produces: `tm1SessionKey(prefix: string, tid: string | null): string` and
  `export const TM1_LAST_PATH_PREFIX = 'apl-eds:last-path'` — both consumed by
  Task 4 (`route-persistence.tsx`), Task 5 (`tm1-vin-auto-redirect.tsx`), and
  Task 8 (`route-restore-gate.tsx`).

- [ ] **Step 1: Write the helper**

```ts
// src/lib/tm1-session-key.ts

// TM1 can host several of our iframes at once (one per TM1 task tab), all
// same-origin and sharing one sessionStorage bucket — so every per-task flag
// or cache value is namespaced by TM1's task id to stop tabs from clobbering
// each other. Falls back to the bare prefix when `tid` is absent (local dev,
// direct access, or before TM1 adds it).
export function tm1SessionKey(prefix: string, tid: string | null): string {
  return tid ? `${prefix}:${tid}` : prefix;
}

export const TM1_LAST_PATH_PREFIX = 'apl-eds:last-path';
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS (new file has no consumers yet, but must be syntactically/type valid on its own).

- [ ] **Step 3: Commit**

```bash
git add src/lib/tm1-session-key.ts
git commit -m "Add shared TM1 session-key namespacing helper"
```

---

### Task 2: `Tm1TaskProvider` context, `useTm1TaskId` hook, `Tm1Link`

**Files:**
- Create: `src/components/tm1-task-context.tsx`

**Interfaces:**
- Consumes: nothing new (uses `next/navigation`'s `useSearchParams`, `next/link`).
- Produces: `Tm1TaskProvider({ children }: { children: ReactNode })`,
  `useTm1TaskId(): string | null`, `Tm1Link` (same prop shape as `next/link`'s
  default export). Consumed by Task 3 (layout wiring), Task 4, Task 5, Task 6
  (`breadcrumb.tsx`), Task 8.

- [ ] **Step 1: Write the context, hook, and link wrapper**

```tsx
// src/components/tm1-task-context.tsx
'use client';

import { createContext, useContext, useState, type ComponentProps, type ReactNode } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const Tm1TaskIdContext = createContext<string | null>(null);

// Captured exactly once, on this iframe instance's true first render, from
// the `tid` TM1 puts on our entry URL. TM1 opens every task in its own fresh
// iframe (live-verified: switching TM1's own task tabs changes
// `window.__NEXT_WORKTASKID__` without recreating our iframe), so a value
// captured at mount stays correct for this iframe's whole life — internal
// client-side navigation (e.g. a breadcrumb link to a bare `/`) never changes
// it. That's the fix: components used to independently re-read `tid` from
// `useSearchParams()` on every render, so a link that dropped it made one
// component think it was looking at a brand-new task while another still
// remembered the real one.
export function Tm1TaskProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const [tid] = useState(() => searchParams.get('tid'));
  return <Tm1TaskIdContext.Provider value={tid}>{children}</Tm1TaskIdContext.Provider>;
}

export function useTm1TaskId(): string | null {
  return useContext(Tm1TaskIdContext);
}

type Tm1LinkProps = ComponentProps<typeof Link>;

// Wrapper around next/link that appends the current TM1 task id to any
// relative href pointing back into our own app, so callers (breadcrumbs, etc.)
// never need to remember to carry it forward themselves.
export function Tm1Link({ href, ...props }: Tm1LinkProps) {
  const tid = useTm1TaskId();
  const resolvedHref = typeof href === 'string' ? withTid(href, tid) : href;
  return <Link href={resolvedHref} {...props} />;
}

function withTid(href: string, tid: string | null): string {
  if (!tid) return href;
  const [path, query] = href.split('?');
  const params = new URLSearchParams(query);
  params.set('tid', tid);
  return `${path}?${params}`;
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/tm1-task-context.tsx
git commit -m "Add Tm1TaskProvider context and Tm1Link href helper"
```

---

### Task 3: Wire `Tm1TaskProvider` into root layout

**Files:**
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `Tm1TaskProvider` from Task 2.

- [ ] **Step 1: Wrap the body's dynamic children in the provider**

Current (`src/app/layout.tsx:5-7,39-47`):

```tsx
import { AppHeader } from '@/components/header';
import { HeaderVisibility } from '@/components/header-visibility';
import { RoutePersistence } from '@/components/route-persistence';
...
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Suspense fallback={null}>
          <RoutePersistence />
        </Suspense>
        <HeaderVisibility>
          <AppHeader />
        </HeaderVisibility>
        <main className="flex-1">{children}</main>
      </body>
```

Replace with:

```tsx
import { AppHeader } from '@/components/header';
import { HeaderVisibility } from '@/components/header-visibility';
import { RoutePersistence } from '@/components/route-persistence';
import { Tm1TaskProvider } from '@/components/tm1-task-context';
...
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Suspense fallback={null}>
          <Tm1TaskProvider>
            <RoutePersistence />
            <HeaderVisibility>
              <AppHeader />
            </HeaderVisibility>
            <main className="flex-1">{children}</main>
          </Tm1TaskProvider>
        </Suspense>
      </body>
```

`Tm1TaskProvider` itself calls `useSearchParams()`, same as `RoutePersistence`
already did — it needs the same `<Suspense>` ancestor `RoutePersistence` already
had, and now everything that needs `useTm1TaskId()` (breadcrumbs, the VIN
auto-redirect, the restore gate — all live under `{children}`) is inside the
provider's tree.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Manual smoke check**

Run: `npm run dev`, open `http://localhost:3000/` in a plain (non-TM1) browser tab.
Expected: Brand Grid renders normally, no console errors, header still shows.
This confirms the added Suspense nesting doesn't blank the page outside TM1.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "Wire Tm1TaskProvider into root layout"
```

---

### Task 4: Simplify `route-persistence.tsx` — use context, stop recording boot state

**Files:**
- Modify: `src/components/route-persistence.tsx`

**Interfaces:**
- Consumes: `useTm1TaskId` (Task 2), `tm1SessionKey` + `TM1_LAST_PATH_PREFIX`
  (Task 1).
- Produces: unchanged public shape (`RoutePersistence()` component, no props) —
  Task 9's `RouteRestoreGate` reads the *same* sessionStorage key this writes,
  via the same `tm1SessionKey(TM1_LAST_PATH_PREFIX, tid)` call.

- [ ] **Step 1: Replace the whole file**

The restore-on-mount half moves to `RouteRestoreGate` (Task 8) — this component
now only records navigations, using `tid` from context instead of its own
`useSearchParams().get('tid')`, and skips writing on its first render (the boot
state) so a raw entry URL like `/?lid=32&token=Bearer+eyJ...` is never persisted
as a "last path" to replay later.

```tsx
// src/components/route-persistence.tsx
'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTm1TaskId } from '@/components/tm1-task-context';
import { tm1SessionKey, TM1_LAST_PATH_PREFIX } from '@/lib/tm1-session-key';

// When embedded as a TM1 iframe (see temp/NEXT_CATALOGUE_IFRAME_REFRESH_BEHAVIOR.md),
// the parent refreshing its own tab recreates our iframe at the fixed entry URL
// ('/'), discarding whatever the user had navigated to. RouteRestoreGate
// (src/components/route-restore-gate.tsx) is what restores it on the Brand
// Grid page — this component only records navigations for that restore to
// read later, namespaced by TM1's task id (tm1-task-context.tsx) so TM1's
// several same-origin iframes don't clobber each other's sessionStorage
// entries.
export function RoutePersistence() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tid = useTm1TaskId();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip this iframe's boot state — whatever raw entry URL TM1 created it
    // with (possibly carrying a one-shot Bearer token) is not a real in-app
    // route, and must never be replayed later.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const query = searchParams.toString();
    const current = query ? `${pathname}?${query}` : pathname;
    try {
      sessionStorage.setItem(tm1SessionKey(TM1_LAST_PATH_PREFIX, tid), current);
    } catch {
      // sessionStorage unavailable (e.g. partitioned/blocked third-party
      // storage in a cross-origin iframe) — ignore, nothing to persist.
    }
  }, [pathname, searchParams, tid]);

  return null;
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/route-persistence.tsx
git commit -m "Route tid through Tm1TaskProvider; stop persisting boot-state URLs"
```

---

### Task 5: Simplify `tm1-vin-auto-redirect.tsx` — use context

**Files:**
- Modify: `src/components/tm1-vin-auto-redirect.tsx`

**Interfaces:**
- Consumes: `useTm1TaskId` (Task 2), `tm1SessionKey` (Task 1).
- Produces: unchanged public shape (`Tm1VinAutoRedirect()` component, no props).

- [ ] **Step 1: Swap the tid source, keep everything else**

Current (`src/components/tm1-vin-auto-redirect.tsx:1-16,25-29`):

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCustomerData } from '@/lib/tm1-bridge';

const SESSION_FLAG_PREFIX = 'apl-eds-tm1-vin-autocheck';

// ...
function flagKey(tid: string | null): string {
  return tid ? `${SESSION_FLAG_PREFIX}:${tid}` : SESSION_FLAG_PREFIX;
}

// ...
export function Tm1VinAutoRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ranRef = useRef(false);
  const tid = searchParams.get('tid');
```

Replace with:

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCustomerData } from '@/lib/tm1-bridge';
import { useTm1TaskId } from '@/components/tm1-task-context';
import { tm1SessionKey } from '@/lib/tm1-session-key';

const SESSION_FLAG_PREFIX = 'apl-eds-tm1-vin-autocheck';

// On a TM1 task that already has a vehicle attached, jump straight into its
// catalog instead of making the user pick a brand from scratch. TM1 doesn't
// pass the VIN in the iframe URL itself (no such parameter exists on their
// side yet) — this reuses the getCustomerData postMessage command we already
// rely on elsewhere to read it ourselves. Guarded by a per-task sessionStorage
// flag, namespaced via Tm1TaskProvider's frozen tid rather than re-read from
// the current URL — that was the bug: a breadcrumb link back to a bare "/"
// made this component think it was a brand-new task and re-fire, so
// navigating back to "/" mid-task (e.g. the "Начало" breadcrumb) doesn't keep
// re-redirecting away from a deliberate return to the Brand Grid.
export function Tm1VinAutoRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ranRef = useRef(false);
  const tid = useTm1TaskId();

  useEffect(() => {
    if (searchParams.get('vin') || ranRef.current) return;
    if (typeof window === 'undefined' || window.self === window.top) return;
    const flagKey = tm1SessionKey(SESSION_FLAG_PREFIX, tid);
    if (sessionStorage.getItem(flagKey)) return;
    ranRef.current = true;
    sessionStorage.setItem(flagKey, '1');

    getCustomerData().then((data) => {
      if (data?.vehicle?.vin) {
        // Carry `tid` forward — otherwise this hop drops it from the URL.
        const params = new URLSearchParams({ vin: data.vehicle.vin });
        if (tid) params.set('tid', tid);
        router.replace(`/?${params}`);
      }
    });
  }, [searchParams, router, tid]);

  return null;
}
```

(The local `function flagKey(tid)` helper is gone — replaced by the shared
`tm1SessionKey` call inline in the effect, same as before but sourced from one
place instead of duplicated per file.)

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/tm1-vin-auto-redirect.tsx
git commit -m "Read tid from Tm1TaskProvider in Tm1VinAutoRedirect"
```

---

### Task 6: Route `breadcrumb.tsx`'s internal links through `Tm1Link`

**Files:**
- Modify: `src/components/catalog/breadcrumb.tsx`

**Interfaces:**
- Consumes: `Tm1Link` (Task 2).
- Produces: unchanged public shape (`Breadcrumb({ segments })`, `BreadcrumbSegment`
  type) — every existing caller (`catalog/[brand]/page.tsx`,
  `catalog/[brand]/groups/page.tsx`, `catalog/[brand]/groups/parts/page.tsx` ×2,
  `vehicle-wizard.tsx`) keeps passing `{ label: t('start', lang), href: '/' }`
  unchanged; the tid-appending now happens inside `Breadcrumb` itself, so none
  of those 5 call sites need editing.

- [ ] **Step 1: Swap `next/link` for `Tm1Link`**

Current (`src/components/catalog/breadcrumb.tsx:1-2`):

```tsx
import Link from 'next/link';
import { ChevronRight, Play } from 'lucide-react';
```

Replace with:

```tsx
import { ChevronRight, Play } from 'lucide-react';
import { Tm1Link } from '@/components/tm1-task-context';
```

Then replace every `<Link` with `<Tm1Link` (3 occurrences: `seg.nav.prevHref`,
`seg.nav.nextHref`, `seg.href`) and every closing `</Link>` with `</Tm1Link>`.
The rest of `breadcrumb.tsx` (props, structure, styling) is unchanged.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/catalog/breadcrumb.tsx
git commit -m "Route breadcrumb links through Tm1Link so tid always carries forward"
```

---

### Task 7: Add `pleaseWait` i18n key

**Files:**
- Modify: `src/lib/i18n.ts`

**Interfaces:**
- Produces: `t('pleaseWait', lang)`, consumed by Task 8.

- [ ] **Step 1: Add the key to both locales**

In the `en` block (`src/lib/i18n.ts:20`), right after `loading: 'Loading…',`:

```ts
    loading: 'Loading…',
    pleaseWait: 'Please wait',
```

In the `bg` block (`src/lib/i18n.ts:116`), right after `loading: 'Зарежда се…',`:

```ts
    loading: 'Зарежда се…',
    pleaseWait: 'Моля, изчакайте',
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS (the `TranslationKey` type is derived from `typeof translations.en`,
so both locales must define the same keys or this fails).

- [ ] **Step 3: Commit**

```bash
git add src/lib/i18n.ts
git commit -m "Add pleaseWait i18n key"
```

---

### Task 8: `RouteRestoreGate` component

**Files:**
- Create: `src/components/route-restore-gate.tsx`

**Interfaces:**
- Consumes: `useTm1TaskId` (Task 2), `tm1SessionKey` + `TM1_LAST_PATH_PREFIX`
  (Task 1), `t` + `Lang` (Task 7 adds the key it renders).
- Produces: `RouteRestoreGate({ lang, children }: { lang: Lang; children:
  ReactNode })`, consumed by Task 9 (`src/app/page.tsx`).

- [ ] **Step 1: Write the component**

```tsx
// src/components/route-restore-gate.tsx
'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useTm1TaskId } from '@/components/tm1-task-context';
import { tm1SessionKey, TM1_LAST_PATH_PREFIX } from '@/lib/tm1-session-key';
import { t, type Lang } from '@/lib/i18n';

interface RouteRestoreGateProps {
  lang: Lang;
  children: ReactNode;
}

// Guards the Brand Grid's first paint: if a last-visited in-app route is
// saved for this TM1 task (see route-persistence.tsx), replace to it before
// ever showing the grid, instead of painting the grid and yanking the user
// away from it a moment later. Because this is a Client Component whose
// initial state is `ready: false`, the server-rendered HTML is already the
// spinner — the grid (already fetched server-side, sitting in `children`)
// never paints before the redirect decision is made.
export function RouteRestoreGate({ lang, children }: RouteRestoreGateProps) {
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const tid = useTm1TaskId();

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(tm1SessionKey(TM1_LAST_PATH_PREFIX, tid));
      if (saved && saved !== '/') {
        router.replace(saved);
        return;
      }
    } catch {
      // sessionStorage unavailable — nothing to restore, fall through to ready.
    }
    setReady(true);
  }, [tid, router]);

  if (!ready) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{t('loading', lang)}</p>
        <p className="text-sm text-muted-foreground">{t('pleaseWait', lang)}</p>
      </div>
    );
  }

  return <>{children}</>;
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/route-restore-gate.tsx
git commit -m "Add RouteRestoreGate to replace the Brand Grid flash with a spinner"
```

---

### Task 9: Wire `RouteRestoreGate` into the Brand Grid page

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `RouteRestoreGate` (Task 8).

- [ ] **Step 1: Wrap the grid branch's return in the gate**

Current (`src/app/page.tsx:1-11,94-127`):

```tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { getCatalogs, getLang, searchVehicleByVinGlobal } from '@/actions/yq';
import { BrandCard } from '@/components/brand-card';
import { VinSearchBox } from '@/components/catalog/vin-search-box';
import { Tm1VinAutoRedirect } from '@/components/tm1-vin-auto-redirect';
import { buildVehicleGroupsHref } from '@/lib/vehicle-nav';
import { t } from '@/lib/i18n';
import type { Lang } from '@/lib/i18n';
import type { VehicleV2Dto } from '@/types/yq';
...
  const catalogsRes = await getCatalogs();
  const catalogs = catalogsRes.data?.catalogs ?? [];
  const activeCatalogs = catalogs.filter((c) => !c.archived);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Tm1VinAutoRedirect />
      <div className="mb-8 flex flex-col items-center text-center">
        <h2 className="text-sm font-medium text-muted-foreground">
          {t('vehicleIdentification', lang as Lang)}
        </h2>
        <VinSearchBox lang={lang as Lang} className="mt-2 w-full max-w-sm" />
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t('selectBrand', lang as Lang)}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {activeCatalogs.length} {t('allBrands', lang as Lang).toLowerCase()}
        </p>
      </div>

      {catalogs.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border">
          <p className="text-muted-foreground">
            {process.env.YQ_API_KEY
              ? t('noResults', lang as Lang)
              : t('missingApiKeyHint', lang as Lang)}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {activeCatalogs.map((catalog) => (
            <BrandCard key={catalog.token} catalog={catalog} />
          ))}
        </div>
      )}
    </div>
  );
}
```

Replace with (add the import, wrap the returned `<div>` in `RouteRestoreGate`):

```tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { getCatalogs, getLang, searchVehicleByVinGlobal } from '@/actions/yq';
import { BrandCard } from '@/components/brand-card';
import { VinSearchBox } from '@/components/catalog/vin-search-box';
import { Tm1VinAutoRedirect } from '@/components/tm1-vin-auto-redirect';
import { RouteRestoreGate } from '@/components/route-restore-gate';
import { buildVehicleGroupsHref } from '@/lib/vehicle-nav';
import { t } from '@/lib/i18n';
import type { Lang } from '@/lib/i18n';
import type { VehicleV2Dto } from '@/types/yq';
...
  const catalogsRes = await getCatalogs();
  const catalogs = catalogsRes.data?.catalogs ?? [];
  const activeCatalogs = catalogs.filter((c) => !c.archived);

  return (
    <RouteRestoreGate lang={lang as Lang}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Tm1VinAutoRedirect />
        <div className="mb-8 flex flex-col items-center text-center">
          <h2 className="text-sm font-medium text-muted-foreground">
            {t('vehicleIdentification', lang as Lang)}
          </h2>
          <VinSearchBox lang={lang as Lang} className="mt-2 w-full max-w-sm" />
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold">{t('selectBrand', lang as Lang)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeCatalogs.length} {t('allBrands', lang as Lang).toLowerCase()}
          </p>
        </div>

        {catalogs.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border">
            <p className="text-muted-foreground">
              {process.env.YQ_API_KEY
                ? t('noResults', lang as Lang)
                : t('missingApiKeyHint', lang as Lang)}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {activeCatalogs.map((catalog) => (
              <BrandCard key={catalog.token} catalog={catalog} />
            ))}
          </div>
        )}
      </div>
    </RouteRestoreGate>
  );
}
```

(The `VinDeepLink` branch earlier in the same function, for `?vin=` requests, is
untouched — the gate only wraps the plain Brand Grid branch.)

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Full check**

Run: `npm run check`
Expected: PASS (lint + typecheck + build all green).

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "Show a spinner instead of the Brand Grid while restoring last path"
```

---

### Task 10: Manual end-to-end verification against live TM1

**Files:** none (verification only).

- [ ] **Step 1: Reproduce the original bug scenario**

In a real TM1 session (`tm1.carparts-cat.com`), open a task with a vehicle already
attached → open OEM Parts Catalog → navigate into a group (e.g. "каросерия") →
click the "Начало" breadcrumb inside the catalog panel.

Expected: lands directly on a clean Brand Grid ("Изберете марка") — does **not**
bounce back into the vehicle's catalog. Check the iframe's sessionStorage
(DevTools → Application → Session Storage → the `apl-eds.autoplus.bg` frame): only
one `apl-eds-tm1-vin-autocheck:<tid>` key should exist — no second, un-namespaced
`apl-eds-tm1-vin-autocheck` key should appear.

- [ ] **Step 2: Verify the spinner replaces the grid flash**

With a last-path already saved (browse into a vehicle's catalog, then switch to a
different TM1 task tab and back — this re-triggers the iframe-refresh-and-restore
flow). Expected: a spinner with "Зарежда се… / Моля, изчакайте" appears briefly
instead of a flash of the Brand Grid, then the last-visited catalog page loads.

- [ ] **Step 3: Regression check — normal Brand Grid load**

Open the module fresh (no saved last-path for this task, e.g. a brand-new TM1
task). Expected: spinner flashes very briefly (one effect tick), then the Brand
Grid renders normally — no infinite spinner, no console errors.

- [ ] **Step 4: Regression check — breadcrumbs elsewhere**

From a parts list page (deepest breadcrumb trail: Начало / Brand / VIN / Model /
Group), click each breadcrumb segment in turn. Expected: every hop lands on the
correct page, URLs in the address bar show `?tid=...` appended (visible proof
`Tm1Link` is working), no broken links.

- [ ] **Step 5: Final commit (if any fixups were needed)**

If steps 1-4 required code fixes, commit them individually with a description of
what was wrong; otherwise this task ends with nothing to commit.
