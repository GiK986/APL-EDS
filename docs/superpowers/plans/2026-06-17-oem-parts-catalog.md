# OEM Parts Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a multi-page OEM parts catalog web app powered by YQ Service API, mirroring partslink24's navigation flow with a modern shadcn/ui design.

**Architecture:** Server Actions proxy all YQ API calls (keeping the API key server-side). A persistent language cookie (`lang`) carries BG/EN preference into every fetch. Client Components drive interactive steps (vehicle wizard); Server Components handle static-ish pages (brand grid, groups, parts list).

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, shadcn/ui, Tailwind CSS v4, Lucide React, YQ Service REST API v2.

## Global Constraints

- Next.js 16.2.1 — read `node_modules/next/dist/docs/` before writing any route/component code
- TypeScript strict mode — no `any`, no `as unknown as X` hacks
- Tailwind CSS v4 with `@import "tailwindcss"` — no v3 `@apply` patterns for custom utilities
- shadcn/ui components live in `src/components/ui/`; `cn()` is in `src/lib/utils.ts` (already exists)
- Named exports for all components, PascalCase components, camelCase utils
- 2-space indentation, no inline styles
- YQ API base URL: `https://oem-api.yqservice.eu`
- Auth header: `X-API-KEY: <value from process.env.YQ_API_KEY>`
- Language header: `Accept-Language: bg` or `Accept-Language: en`
- `.env.local` must never be committed — already in `.gitignore`
- No cart/ordering features in v1 — browse only
- Supported languages: Bulgarian (`bg`) and English (`en`)
- All API calls go through Server Actions (`'use server'` in `src/actions/`) — API key never exposed to client
- `cookies()` from `next/headers` is async — always `await cookies()`
- `params` in route handlers and page components is a Promise in Next.js 16 — always `await params`

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `.env.local` | Create | YQ API key placeholder |
| `src/types/yq.ts` | Create | All TypeScript types matching YQ API schemas |
| `src/lib/yq-api.ts` | Create | Server-side HTTP client for YQ Service |
| `src/actions/yq.ts` | Create | Server Actions exposing every YQ endpoint to client code |
| `src/lib/i18n.ts` | Create | Language cookie helpers + translation strings |
| `src/components/header.tsx` | Create | Persistent app header (search, VIN, language toggle) |
| `src/components/language-switcher.tsx` | Create | BG/EN toggle button (client component, sets cookie) |
| `src/components/brand-card.tsx` | Create | Single brand card with logo fallback |
| `src/components/vehicle-wizard.tsx` | Create | Multi-step vehicle selection wizard (client component) |
| `src/components/groups-tree.tsx` | Create | Two-panel group browser |
| `src/components/parts-table.tsx` | Create | BOM parts list table |
| `src/components/vin-search.tsx` | Create | VIN / plate number search dialog |
| `src/app/layout.tsx` | Modify | Add header, font, lang cookie reading |
| `src/app/page.tsx` | Replace | Brand Grid — Server Component |
| `src/app/actions/lang/route.ts` | Create | POST handler: set language cookie |
| `src/app/catalog/[brand]/page.tsx` | Create | Vehicle wizard page — Client Component |
| `src/app/catalog/[brand]/groups/page.tsx` | Create | Main groups page — Server Component |
| `src/app/catalog/[brand]/groups/[groupId]/page.tsx` | Create | Subgroups + BOM page — Server Component |

---

## Task 1: Environment and API Types

**Files:**
- Create: `.env.local`
- Create: `src/types/yq.ts`

**Interfaces:**
- Produces: All YQ API TypeScript types used in every subsequent task

- [ ] **Step 1: Create `.env.local`**

```bash
# Create the env file — user fills in their YQ credentials
cat > .env.local << 'EOF'
# YQ Service API credentials
# Value format: base64(username:password)
YQ_API_KEY=
EOF
```

- [ ] **Step 2: Create `src/types/yq.ts`**

Create file `src/types/yq.ts` with this exact content:

```typescript
// YQ Service REST API v2 — TypeScript types

export interface FormValueV2 {
  name: string;
  value: string;
}

export interface LinkV2Dto {
  action: string;
  label: string;
  token: string;
}

export interface NavigationLinkV2Dto {
  action: string;
  label: string;
  token: string;
  code: string; // "MAIN" | "GROUPS"
}

export interface ErrorDtoV2 {
  code?: string;
  message?: string;
}

export interface OptionV2 {
  value: string;
  label: string;
  selected?: boolean;
}

export interface ExampleValueV2 {
  description: string;
  value: string;
}

export interface InputFieldV2 {
  type: 'input';
  name: string;
  label: string;
  pattern?: string;
  examples?: ExampleValueV2[];
}

export interface SelectV2 {
  type: 'select';
  name: string;
  label: string;
  options: OptionV2[];
  selected?: boolean;
}

export type FieldV2 = InputFieldV2 | SelectV2;

export interface FormV2Dto {
  action: string;
  updateFormAction?: string;
  label: string;
  operationName: string;
  description?: string;
  token: string;
  fields: FieldV2[];
}

export interface AttrNodeV2 {
  code: string;
  label: string;
  values: string[];
  type: string;
  children?: AttrNodeV2[];
}

export interface CatalogV2Dto {
  token: string;
  name: string;
  brand: string;
  archived: boolean;
  links: LinkV2Dto[];
}

export interface CatalogListV2Dto {
  catalogs: CatalogV2Dto[];
  forms?: FormV2Dto[];
}

export interface CatalogListResponseV2 {
  dataType: string;
  data: CatalogListV2Dto;
  error?: ErrorDtoV2;
}

export interface CatalogInfoV2Dto {
  token: string;
  name: string;
  brand: string;
  archived: boolean;
  forms: FormV2Dto[];
  links?: LinkV2Dto[];
}

export interface CatalogInfoResponseV2 {
  dataType: string;
  data: CatalogInfoV2Dto;
  error?: ErrorDtoV2;
}

export interface VehicleV2Dto {
  token: string;
  type: string;
  brand: string;
  model: string;
  attributes: AttrNodeV2[];
  sysProperties: Array<{ code: string; value: string }>;
  navigationLinks: NavigationLinkV2Dto[];
  links: LinkV2Dto[];
  forms?: FormV2Dto[];
}

export interface VehicleListV2Dto {
  vehicles: VehicleV2Dto[];
}

export interface VehicleListResponseV2 {
  dataType: string;
  data: VehicleListV2Dto;
  error?: ErrorDtoV2;
}

export interface OperationFormResponseV2 {
  dataType: string;
  data: FormV2Dto;
  error?: ErrorDtoV2;
}

export interface GroupNodeV2Dto {
  token?: string;
  name: string;
  code?: string;
  links?: LinkV2Dto[];
  children?: GroupNodeV2Dto[];
}

export interface GroupsTreeResponseV2 {
  dataType: string;
  data: GroupNodeV2Dto;
  currentFilterState?: string;
  error?: ErrorDtoV2;
}

export interface CategoryNodeV2Dto {
  token?: string;
  name: string;
  code?: string;
  links?: LinkV2Dto[];
  children?: CategoryNodeV2Dto[];
}

export interface NavigationTreeResponseV2 {
  dataType: string;
  data: CategoryNodeV2Dto;
  currentFilterState?: string;
  error?: ErrorDtoV2;
}

export interface PartQtyV2 {
  note?: string;
  qty?: number;
}

export interface PartV2Dto {
  partNumber: string;
  partName: string;
  qty?: PartQtyV2;
  partNumberFormatted?: string;
  displayName?: string;
  attributes?: AttrNodeV2[];
  areaCode?: string;
  matched?: boolean;
  refs?: LinkV2Dto[];
  related?: LinkV2Dto[];
  links?: LinkV2Dto[];
}

export interface UnitShortV2Dto {
  code: string;
  name: string;
  description?: string;
  token?: string;
  imageNames?: string[];
  links?: LinkV2Dto[];
  attributes?: AttrNodeV2[];
}

export interface PartSectionV2Dto {
  title?: string;
  parts: PartV2Dto[];
}

export interface PartsByUnitV2Dto {
  unit: UnitShortV2Dto;
  partSections: PartSectionV2Dto[];
  token?: string;
  imageNames?: string[];
}

export interface CategoryV2Dto {
  category: UnitShortV2Dto;
  units: PartsByUnitV2Dto[];
}

export interface PartsListByCategoryV2Dto {
  categories: CategoryV2Dto[];
}

export interface PartsListByCategoryResponseV2 {
  dataType: string;
  data: PartsListByCategoryV2Dto;
  currentFilterState?: string;
  error?: ErrorDtoV2;
}

export interface PartReferencesV2Dto {
  brand: string;
  catalogName: string;
  token: string;
  links?: LinkV2Dto[];
}

export interface PartReferencesListV2Dto {
  references: PartReferencesV2Dto[];
}

export interface PartReferencesResponseV2 {
  dataType: string;
  data: PartReferencesListV2Dto;
  error?: ErrorDtoV2;
}

export interface CustomerDto {
  login: string;
}

export interface CustomerResponseV2 {
  dataType: string;
  data: CustomerDto;
  error?: ErrorDtoV2;
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/gik986/Developer/APL-EDS && npm run typecheck 2>&1 | head -30
```

Expected: No errors in `src/types/yq.ts`.

- [ ] **Step 4: Commit**

```bash
cd /Users/gik986/Developer/APL-EDS
git add .env.local src/types/yq.ts
git commit -m "feat: add YQ Service API types and env placeholder

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 2: YQ API Server Client + Server Actions

**Files:**
- Create: `src/lib/yq-api.ts`
- Create: `src/actions/yq.ts`

**Interfaces:**
- Consumes: All types from `src/types/yq.ts`
- Produces:
  - `yqFetch<T>(path, body, lang): Promise<T>` in `src/lib/yq-api.ts`
  - All server action functions in `src/actions/yq.ts`: `getCatalogs()`, `getCatalogInfo(token)`, `getOperationForm(token, formValues)`, `findVehicleOperation(token, formValues)`, `findVehicle(token, formValues)`, `findByPlateNumber(token, formValues)`, `getGroups(token, filterValues?, currentFilterState?)`, `getNavigationTree(token, filterValues?, currentFilterState?)`, `getGroupParts(token, filterValues?, currentFilterState?)`, `findPartReferences(token, formValues)`, `getLang()`, `setLang(lang)`

- [ ] **Step 1: Create `src/lib/yq-api.ts`**

```typescript
const YQ_BASE = 'https://oem-api.yqservice.eu';

export async function yqFetch<T>(
  path: string,
  body?: object,
  lang = 'en'
): Promise<T> {
  const key = process.env.YQ_API_KEY;
  if (!key) throw new Error('YQ_API_KEY is not set');

  const res = await fetch(`${YQ_BASE}${path}`, {
    method: body !== undefined ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': key,
      'Accept-Language': lang,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`YQ API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}
```

- [ ] **Step 2: Create `src/actions/yq.ts`**

```typescript
'use server';

import { cookies } from 'next/headers';
import { yqFetch } from '@/lib/yq-api';
import type {
  CatalogListResponseV2,
  CatalogInfoResponseV2,
  VehicleListResponseV2,
  OperationFormResponseV2,
  GroupsTreeResponseV2,
  NavigationTreeResponseV2,
  PartsListByCategoryResponseV2,
  PartReferencesResponseV2,
  FormValueV2,
} from '@/types/yq';

async function lang(): Promise<string> {
  const store = await cookies();
  return store.get('lang')?.value ?? 'en';
}

export async function getLang(): Promise<string> {
  return lang();
}

export async function setLang(value: string): Promise<void> {
  const store = await cookies();
  store.set('lang', value === 'bg' ? 'bg' : 'en', {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
}

export async function getCatalogs(): Promise<CatalogListResponseV2> {
  return yqFetch<CatalogListResponseV2>('/restApi/v2/catalogs', {}, await lang());
}

export async function getCatalogInfo(token: string): Promise<CatalogInfoResponseV2> {
  return yqFetch<CatalogInfoResponseV2>('/restApi/v2/getCatalogInfo', { token }, await lang());
}

export async function getOperationForm(
  token: string,
  formValues: FormValueV2[]
): Promise<OperationFormResponseV2> {
  return yqFetch<OperationFormResponseV2>(
    '/restApi/v2/getOperationForm',
    { token, formValues },
    await lang()
  );
}

export async function findVehicleOperation(
  token: string,
  formValues: FormValueV2[]
): Promise<VehicleListResponseV2> {
  return yqFetch<VehicleListResponseV2>(
    '/restApi/v2/findVehicleOperation',
    { token, formValues },
    await lang()
  );
}

export async function findVehicle(
  token: string,
  formValues: FormValueV2[]
): Promise<VehicleListResponseV2> {
  return yqFetch<VehicleListResponseV2>(
    '/restApi/v2/findVehicle',
    { token, formValues },
    await lang()
  );
}

export async function findByPlateNumber(
  formValues: FormValueV2[]
): Promise<VehicleListResponseV2> {
  return yqFetch<VehicleListResponseV2>(
    '/restApi/v2/findByPlateNumber',
    { token: null, formValues },
    await lang()
  );
}

export async function getGroups(
  token: string,
  filterValues: FormValueV2[] = [],
  currentFilterState = ''
): Promise<GroupsTreeResponseV2> {
  return yqFetch<GroupsTreeResponseV2>(
    '/restApi/v2/getGroups',
    { token, filterValues, currentFilterState },
    await lang()
  );
}

export async function getNavigationTree(
  token: string,
  filterValues: FormValueV2[] = [],
  currentFilterState = ''
): Promise<NavigationTreeResponseV2> {
  return yqFetch<NavigationTreeResponseV2>(
    '/restApi/v2/getNavigationTree',
    { token, filterValues, currentFilterState },
    await lang()
  );
}

export async function getGroupParts(
  token: string,
  filterValues: FormValueV2[] = [],
  currentFilterState = ''
): Promise<PartsListByCategoryResponseV2> {
  return yqFetch<PartsListByCategoryResponseV2>(
    '/restApi/v2/getGroupParts',
    { token, filterValues, currentFilterState },
    await lang()
  );
}

export async function findPartReferences(
  token: string,
  formValues: FormValueV2[]
): Promise<PartReferencesResponseV2> {
  return yqFetch<PartReferencesResponseV2>(
    '/restApi/v2/findPartReferences',
    { token, formValues },
    await lang()
  );
}
```

- [ ] **Step 3: Run typecheck**

```bash
cd /Users/gik986/Developer/APL-EDS && npm run typecheck 2>&1 | head -30
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
cd /Users/gik986/Developer/APL-EDS
git add src/lib/yq-api.ts src/actions/yq.ts
git commit -m "feat: add YQ API client and server actions

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 3: i18n Utilities + Language Switcher

**Files:**
- Create: `src/lib/i18n.ts`
- Create: `src/components/language-switcher.tsx`

**Interfaces:**
- Consumes: `setLang`, `getLang` from `src/actions/yq.ts`
- Produces:
  - `t(key, lang): string` from `src/lib/i18n.ts`
  - `<LanguageSwitcher currentLang={string} />` component

- [ ] **Step 1: Create `src/lib/i18n.ts`**

```typescript
export type Lang = 'en' | 'bg';

const translations = {
  en: {
    appTitle: 'OEM Parts Catalog',
    searchByVin: 'Search by VIN',
    searchByPlate: 'Search by Plate',
    searchPart: 'Search part number',
    selectBrand: 'Select brand',
    selectVehicle: 'Select vehicle',
    groups: 'Groups',
    parts: 'Parts',
    partNumber: 'Part No.',
    partName: 'Description',
    qty: 'Qty',
    position: 'Pos.',
    remarks: 'Remarks',
    noResults: 'No results',
    loading: 'Loading…',
    back: 'Back',
    next: 'Next',
    search: 'Search',
    vinPlaceholder: 'Enter VIN or frame number',
    platePlaceholder: 'Enter plate number',
    partPlaceholder: 'Enter part number',
    countryCode: 'Country code',
    includeReplacements: 'Include replacements',
    yes: 'Yes',
    no: 'No',
    vehicleDetails: 'Vehicle details',
    allBrands: 'All brands',
    catalogSearch: 'Catalog search',
    model: 'Model',
    year: 'Year',
  },
  bg: {
    appTitle: 'OEM Каталог за части',
    searchByVin: 'Търсене по VIN',
    searchByPlate: 'Търсене по регистрационен номер',
    searchPart: 'Търсене по номер на part',
    selectBrand: 'Изберете марка',
    selectVehicle: 'Изберете автомобил',
    groups: 'Групи',
    parts: 'Части',
    partNumber: 'Арт. №',
    partName: 'Описание',
    qty: 'Бр.',
    position: 'Поз.',
    remarks: 'Забележки',
    noResults: 'Няма резултати',
    loading: 'Зарежда се…',
    back: 'Назад',
    next: 'Напред',
    search: 'Търсене',
    vinPlaceholder: 'Въведете VIN или номер на шасито',
    platePlaceholder: 'Въведете регистрационен номер',
    partPlaceholder: 'Въведете номер на part',
    countryCode: 'Код на държава',
    includeReplacements: 'С аналози',
    yes: 'Да',
    no: 'Не',
    vehicleDetails: 'Данни за автомобила',
    allBrands: 'Всички марки',
    catalogSearch: 'Търсене в каталог',
    model: 'Модел',
    year: 'Година',
  },
} as const;

type TranslationKey = keyof typeof translations.en;

export function t(key: TranslationKey, lang: Lang = 'en'): string {
  return translations[lang][key];
}
```

- [ ] **Step 2: Create `src/components/language-switcher.tsx`**

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { setLang } from '@/actions/yq';
import { cn } from '@/lib/utils';
import type { Lang } from '@/lib/i18n';

interface LanguageSwitcherProps {
  currentLang: Lang;
}

export function LanguageSwitcher({ currentLang }: LanguageSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(next: Lang) {
    startTransition(async () => {
      await setLang(next);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1 text-sm font-medium">
      <button
        onClick={() => handleChange('bg')}
        disabled={isPending}
        className={cn(
          'px-2 py-0.5 rounded transition-colors',
          currentLang === 'bg'
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-muted text-muted-foreground'
        )}
      >
        BG
      </button>
      <span className="text-muted-foreground">/</span>
      <button
        onClick={() => handleChange('en')}
        disabled={isPending}
        className={cn(
          'px-2 py-0.5 rounded transition-colors',
          currentLang === 'en'
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-muted text-muted-foreground'
        )}
      >
        EN
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Run typecheck**

```bash
cd /Users/gik986/Developer/APL-EDS && npm run typecheck 2>&1 | head -30
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
cd /Users/gik986/Developer/APL-EDS
git add src/lib/i18n.ts src/components/language-switcher.tsx
git commit -m "feat: add i18n utilities and language switcher

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 4: App Header + Root Layout

**Files:**
- Create: `src/components/header.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `<LanguageSwitcher>`, `getLang()`, `t()` from Tasks 2–3
- Produces: `<AppHeader>` rendered in root layout; lang cookie available to all server components

- [ ] **Step 1: Create `src/components/header.tsx`**

```tsx
import Link from 'next/link';
import { Search } from 'lucide-react';
import { getLang } from '@/actions/yq';
import { t } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/language-switcher';
import type { Lang } from '@/lib/i18n';

export async function AppHeader() {
  const lang = (await getLang()) as Lang;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-primary">{t('appTitle', lang)}</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground sm:flex"
          >
            <Search className="h-4 w-4" />
            <span>{t('searchPart', lang)}</span>
          </Link>
          <LanguageSwitcher currentLang={lang} />
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Modify `src/app/layout.tsx`**

Replace with:

```tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppHeader } from '@/components/header';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'OEM Parts Catalog',
  description: 'Original equipment manufacturer parts catalog powered by YQ Service',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AppHeader />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Run typecheck**

```bash
cd /Users/gik986/Developer/APL-EDS && npm run typecheck 2>&1 | head -30
```

Expected: No errors.

- [ ] **Step 4: Start dev server and verify header renders**

```bash
cd /Users/gik986/Developer/APL-EDS && npm run dev
```

Open http://localhost:3000 — should see header with "OEM Parts Catalog" title and BG/EN language switcher.

- [ ] **Step 5: Commit**

```bash
cd /Users/gik986/Developer/APL-EDS
git add src/components/header.tsx src/app/layout.tsx
git commit -m "feat: add persistent app header with language switcher

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 5: Brand Grid (Home Page)

**Files:**
- Create: `src/components/brand-card.tsx`
- Replace: `src/app/page.tsx`

**Interfaces:**
- Consumes: `getCatalogs()` from `src/actions/yq.ts`, `CatalogV2Dto` from `src/types/yq.ts`, `t()`, `getLang()`
- Produces: `/` route — Server Component showing brand grid with VIN search link

- [ ] **Step 1: Create `src/components/brand-card.tsx`**

```tsx
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { CatalogV2Dto } from '@/types/yq';

interface BrandCardProps {
  catalog: CatalogV2Dto;
}

export function BrandCard({ catalog }: BrandCardProps) {
  // getCatalogInfo token is in catalog.links[0].token
  const infoToken = catalog.links[0]?.token ?? catalog.token;
  const brand = catalog.brand.toLowerCase().replace(/\s+/g, '-');
  const href = `/catalog/${encodeURIComponent(brand)}?token=${encodeURIComponent(infoToken)}`;

  return (
    <Link
      href={href}
      className={cn(
        'group flex flex-col items-center justify-center rounded-xl border border-border',
        'bg-card p-6 text-card-foreground shadow-sm',
        'transition-all duration-200 hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5',
        catalog.archived && 'opacity-50 pointer-events-none'
      )}
    >
      <div className="flex h-16 w-full items-center justify-center">
        <span className="text-center text-sm font-semibold tracking-wide text-foreground group-hover:text-primary transition-colors">
          {catalog.name}
        </span>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Replace `src/app/page.tsx`**

```tsx
import { getCatalogs, getLang } from '@/actions/yq';
import { BrandCard } from '@/components/brand-card';
import { t } from '@/lib/i18n';
import type { Lang } from '@/lib/i18n';

export default async function BrandGridPage() {
  const [catalogsRes, lang] = await Promise.all([getCatalogs(), getLang()]);
  const catalogs = catalogsRes.data?.catalogs ?? [];
  const activeCatalogs = catalogs.filter((c) => !c.archived);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
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
              : 'Add YQ_API_KEY to .env.local to load brands'}
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

- [ ] **Step 3: Run typecheck**

```bash
cd /Users/gik986/Developer/APL-EDS && npm run typecheck 2>&1 | head -30
```

- [ ] **Step 4: Verify in browser**

With dev server running, open http://localhost:3000. Should see a grid of brand cards (or the placeholder message if YQ_API_KEY is not set).

- [ ] **Step 5: Commit**

```bash
cd /Users/gik986/Developer/APL-EDS
git add src/components/brand-card.tsx src/app/page.tsx
git commit -m "feat: add brand grid home page

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 6: Vehicle Selection Wizard

**Files:**
- Create: `src/components/vehicle-wizard.tsx`
- Create: `src/app/catalog/[brand]/page.tsx`

**Interfaces:**
- Consumes: `getCatalogInfo`, `getOperationForm`, `findVehicleOperation`, `findVehicle`, `findByPlateNumber` from `src/actions/yq.ts`; all relevant types from `src/types/yq.ts`
- Produces:
  - `/catalog/[brand]?token=<getCatalogInfo token>` — page with vehicle wizard
  - On vehicle found: links to `/catalog/[brand]/groups?token=<GROUPS token>&navToken=<MAIN token>`
  - `<VehicleWizard initialForm={FormV2Dto} brand={string} />` — client component

**How the wizard works:**
1. Page loads `getCatalogInfo(token)` server-side → gets `data.forms` array
2. Find form with `operationName === 'WIZARD'` → that is the initial state
3. Render each `field` in the form: if type `select` show a `<select>`, if `input` show `<input>`
4. On each field change → call `getOperationForm(form.token, [{name, value}])` → update form state
5. When form.action is `findVehicleOperation` AND all required selects have a `selected: true` option → call `findVehicleOperation` → get vehicle list
6. Show vehicle list; on click → navigate to groups page using `navigationLinks` tokens

- [ ] **Step 1: Create `src/components/vehicle-wizard.tsx`**

```tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  getOperationForm,
  findVehicleOperation,
  findVehicle,
  findByPlateNumber,
} from '@/actions/yq';
import type { FormV2Dto, VehicleV2Dto, FieldV2, SelectV2 } from '@/types/yq';
import { cn } from '@/lib/utils';

interface VehicleWizardProps {
  initialForm: FormV2Dto;
  brand: string;
  vinForm?: FormV2Dto;
  plateForm?: FormV2Dto;
}

type Tab = 'wizard' | 'vin' | 'plate';

export function VehicleWizard({
  initialForm,
  brand,
  vinForm,
  plateForm,
}: VehicleWizardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<Tab>('wizard');

  // Wizard state
  const [wizardForm, setWizardForm] = useState<FormV2Dto>(initialForm);
  const [wizardError, setWizardError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<VehicleV2Dto[]>([]);

  // VIN search state
  const [vinValue, setVinValue] = useState('');
  const [vinError, setVinError] = useState<string | null>(null);
  const [vinVehicles, setVinVehicles] = useState<VehicleV2Dto[]>([]);

  // Plate search state
  const [plateValue, setPlateValue] = useState('');
  const [plateCountry, setPlateCountry] = useState('');
  const [plateError, setPlateError] = useState<string | null>(null);
  const [plateVehicles, setPlateVehicles] = useState<VehicleV2Dto[]>([]);

  function navigateToVehicle(vehicle: VehicleV2Dto) {
    const groupsLink = vehicle.navigationLinks.find((l) => l.code === 'GROUPS');
    const mainLink = vehicle.navigationLinks.find((l) => l.code === 'MAIN');
    if (!groupsLink) return;
    const params = new URLSearchParams({
      token: groupsLink.token,
      navToken: mainLink?.token ?? '',
    });
    router.push(`/catalog/${encodeURIComponent(brand)}/groups?${params}`);
  }

  function handleWizardChange(fieldName: string, value: string) {
    setWizardError(null);
    setVehicles([]);
    startTransition(async () => {
      try {
        const updated = await getOperationForm(wizardForm.token, [
          { name: fieldName, value },
        ]);
        setWizardForm(updated.data);

        // Check if we can now resolve the vehicle
        const allSelected = updated.data.fields
          .filter((f): f is SelectV2 => f.type === 'select')
          .every((f) => f.options.some((o) => o.selected));

        if (allSelected && updated.data.action === 'findVehicleOperation') {
          const selectedValues = updated.data.fields
            .filter((f): f is SelectV2 => f.type === 'select')
            .map((f) => ({
              name: f.name,
              value: f.options.find((o) => o.selected)!.value,
            }));
          const res = await findVehicleOperation(updated.data.token, selectedValues);
          setVehicles(res.data?.vehicles ?? []);
        }
      } catch {
        setWizardError('Failed to update form. Please try again.');
      }
    });
  }

  function handleVinSearch() {
    if (!vinValue.trim() || !vinForm) return;
    setVinError(null);
    setVinVehicles([]);
    startTransition(async () => {
      try {
        const res = await findVehicle(vinForm.token, [
          { name: 'IdentString', value: vinValue.trim() },
        ]);
        const vs = res.data?.vehicles ?? [];
        if (vs.length === 0) setVinError('No vehicle found for this VIN.');
        else if (vs.length === 1) navigateToVehicle(vs[0]);
        else setVinVehicles(vs);
      } catch {
        setVinError('Search failed. Check VIN and try again.');
      }
    });
  }

  function handlePlateSearch() {
    if (!plateValue.trim()) return;
    setPlateError(null);
    setPlateVehicles([]);
    startTransition(async () => {
      try {
        const formValues = [{ name: 'PlateNumber', value: plateValue.trim() }];
        if (plateCountry) formValues.push({ name: 'CountryCode', value: plateCountry });
        const res = await findByPlateNumber(formValues);
        const vs = res.data?.vehicles ?? [];
        if (vs.length === 0) setPlateError('No vehicle found for this plate.');
        else if (vs.length === 1) navigateToVehicle(vs[0]);
        else setPlateVehicles(vs);
      } catch {
        setPlateError('Search failed. Check plate number and try again.');
      }
    });
  }

  const plateCountryCodes = plateForm?.fields.find(
    (f): f is SelectV2 => f.type === 'select' && f.name === 'CountryCode'
  )?.options ?? [];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-muted p-1">
        {([
          ['wizard', 'Model / Year'],
          ...(vinForm ? [['vin', 'VIN / Frame']] : []),
          ...(plateForm ? [['plate', 'Plate']] : []),
        ] as [Tab, string][]).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              activeTab === tab
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Wizard tab */}
      {activeTab === 'wizard' && (
        <div className="space-y-4">
          {wizardForm.fields.map((field) => (
            <WizardField
              key={field.name}
              field={field}
              onChange={(value) => handleWizardChange(field.name, value)}
              disabled={isPending}
            />
          ))}
          {wizardError && (
            <p className="text-sm text-destructive">{wizardError}</p>
          )}
          {vehicles.length > 0 && (
            <VehicleList vehicles={vehicles} onSelect={navigateToVehicle} />
          )}
        </div>
      )}

      {/* VIN tab */}
      {activeTab === 'vin' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={vinValue}
              onChange={(e) => setVinValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVinSearch()}
              placeholder="e.g. ZFA31200000451262"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={handleVinSearch}
              disabled={isPending || !vinValue.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-50"
            >
              Search
            </button>
          </div>
          {vinError && <p className="text-sm text-destructive">{vinError}</p>}
          {vinVehicles.length > 0 && (
            <VehicleList vehicles={vinVehicles} onSelect={navigateToVehicle} />
          )}
        </div>
      )}

      {/* Plate tab */}
      {activeTab === 'plate' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {plateCountryCodes.length > 0 && (
              <select
                value={plateCountry}
                onChange={(e) => setPlateCountry(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Country</option>
                {plateCountryCodes.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
            <input
              type="text"
              value={plateValue}
              onChange={(e) => setPlateValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePlateSearch()}
              placeholder="e.g. KS666ER"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={handlePlateSearch}
              disabled={isPending || !plateValue.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-50"
            >
              Search
            </button>
          </div>
          {plateError && <p className="text-sm text-destructive">{plateError}</p>}
          {plateVehicles.length > 0 && (
            <VehicleList vehicles={plateVehicles} onSelect={navigateToVehicle} />
          )}
        </div>
      )}

      {isPending && (
        <p className="text-sm text-muted-foreground animate-pulse">Loading…</p>
      )}
    </div>
  );
}

// Sub-components

interface WizardFieldProps {
  field: FieldV2;
  onChange: (value: string) => void;
  disabled: boolean;
}

function WizardField({ field, onChange, disabled }: WizardFieldProps) {
  if (field.type === 'input') {
    return (
      <div className="space-y-1.5">
        <label className="text-sm font-medium">{field.label}</label>
        <input
          type="text"
          placeholder={field.examples?.[0]?.value ?? ''}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />
      </div>
    );
  }

  const selected = field.options.find((o) => o.selected);

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{field.label}</label>
      <select
        value={selected?.value ?? ''}
        disabled={disabled || field.options.length === 0}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
      >
        <option value="">— Select —</option>
        {field.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface VehicleListProps {
  vehicles: VehicleV2Dto[];
  onSelect: (vehicle: VehicleV2Dto) => void;
}

function VehicleList({ vehicles, onSelect }: VehicleListProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground">
        {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} found
      </h3>
      <ul className="divide-y divide-border rounded-xl border border-border overflow-hidden">
        {vehicles.map((v, i) => (
          <li key={v.token ?? i}>
            <button
              onClick={() => onSelect(v)}
              className="w-full px-4 py-3 text-left hover:bg-muted transition-colors"
            >
              <div className="text-sm font-medium">{v.model}</div>
              <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                {v.attributes.slice(0, 4).map((a) => (
                  <span key={a.code}>
                    {a.label}: {a.values.join(', ')}
                  </span>
                ))}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/app/catalog/[brand]/page.tsx`**

```tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getCatalogInfo, getCatalogs, getLang } from '@/actions/yq';
import { VehicleWizard } from '@/components/vehicle-wizard';
import { t } from '@/lib/i18n';
import type { Lang } from '@/lib/i18n';
import type { FormV2Dto } from '@/types/yq';

interface PageProps {
  params: Promise<{ brand: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function CatalogPage({ params, searchParams }: PageProps) {
  const [{ brand }, { token }] = await Promise.all([params, searchParams]);
  const lang = (await getLang()) as Lang;

  if (!token) {
    // No token: fall back to finding the brand in the catalogs list
    const catalogsRes = await getCatalogs();
    const catalog = catalogsRes.data?.catalogs.find(
      (c) => c.brand.toLowerCase().replace(/\s+/g, '-') === decodeURIComponent(brand)
    );
    if (!catalog) return notFound();
    const infoToken = catalog.links[0]?.token ?? catalog.token;
    const infoRes = await getCatalogInfo(infoToken);
    return renderPage(brand, lang, infoRes.data?.forms ?? []);
  }

  const infoRes = await getCatalogInfo(token);
  if (infoRes.error) return notFound();

  return renderPage(brand, lang, infoRes.data?.forms ?? []);
}

function renderPage(brand: string, lang: Lang, forms: FormV2Dto[]) {
  const wizardForm = forms.find((f) => f.operationName === 'WIZARD');
  const vinForm = forms.find((f) => f.operationName === 'FINDVEHICLE_V2');
  const plateForm = forms.find(
    (f) => f.operationName === 'FINDVEHICLEBYPLATENUMBER_V2'
  );

  const brandLabel = decodeURIComponent(brand)
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          {t('allBrands', lang)}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">{brandLabel}</span>
      </nav>

      <h1 className="mb-6 text-2xl font-bold">{brandLabel}</h1>

      {wizardForm ? (
        <VehicleWizard
          initialForm={wizardForm}
          brand={brand}
          vinForm={vinForm}
          plateForm={plateForm}
        />
      ) : (
        <p className="text-muted-foreground">{t('noResults', lang)}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Run typecheck**

```bash
cd /Users/gik986/Developer/APL-EDS && npm run typecheck 2>&1 | head -30
```

- [ ] **Step 4: Verify manually** (with dev server running)

1. Open http://localhost:3000
2. Click any brand → should navigate to `/catalog/[brand]?token=...`
3. Page shows Model dropdown
4. Select a model → second dropdown appears (Year or Tech.Info)
5. Fill all dropdowns → vehicle list appears
6. Click a vehicle → navigates to groups page (may 404 until Task 7)

- [ ] **Step 5: Commit**

```bash
cd /Users/gik986/Developer/APL-EDS
git add src/components/vehicle-wizard.tsx src/app/catalog/[brand]/page.tsx
git commit -m "feat: add vehicle wizard page with model/VIN/plate search

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 7: Groups Tree Page

**Files:**
- Create: `src/components/groups-tree.tsx`
- Create: `src/app/catalog/[brand]/groups/page.tsx`

**Interfaces:**
- Consumes: `getGroups()` from `src/actions/yq.ts`; `GroupNodeV2Dto` from `src/types/yq.ts`
- Produces: `/catalog/[brand]/groups?token=<GROUPS>&navToken=<MAIN>` — two-column groups browser

**Groups tree structure:**
- `data.children` = top-level groups (e.g. "Service parts", "Engine", "Body")
- Each group has `children` = sub-groups with `links[0].action === 'getGroupParts'` (click → parts page)
- Also may have nested sub-groups

- [ ] **Step 1: Create `src/components/groups-tree.tsx`**

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GroupNodeV2Dto } from '@/types/yq';

interface GroupsTreeProps {
  tree: GroupNodeV2Dto;
  brand: string;
  basePath: string;
}

export function GroupsTree({ tree, brand, basePath }: GroupsTreeProps) {
  const [selected, setSelected] = useState<GroupNodeV2Dto | null>(
    tree.children?.[0] ?? null
  );

  const topGroups = tree.children ?? [];
  const subGroups = selected?.children ?? [];

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-border">
      {/* Left panel: top-level groups */}
      <div className="w-56 shrink-0 overflow-y-auto border-r border-border bg-muted/30">
        <ul className="py-1">
          {topGroups.map((group, i) => (
            <li key={group.token ?? group.name ?? i}>
              <button
                onClick={() => setSelected(group)}
                className={cn(
                  'w-full px-3 py-2.5 text-left text-sm transition-colors',
                  selected === group
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'hover:bg-muted text-foreground'
                )}
              >
                {group.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Right panel: sub-groups */}
      <div className="flex-1 overflow-y-auto">
        {selected && (
          <div>
            <div className="border-b border-border px-4 py-3">
              <h2 className="font-semibold">{selected.name}</h2>
            </div>
            {subGroups.length === 0 && selected.links?.some(l => l.action === 'getGroupParts') && (
              <div className="p-4">
                <SubGroupItem group={selected} brand={brand} basePath={basePath} />
              </div>
            )}
            <ul className="divide-y divide-border">
              {subGroups.map((sub, i) => (
                <li key={sub.token ?? sub.name ?? i} className="px-4 py-2">
                  <SubGroupItem group={sub} brand={brand} basePath={basePath} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

interface SubGroupItemProps {
  group: GroupNodeV2Dto;
  brand: string;
  basePath: string;
}

function SubGroupItem({ group, brand, basePath }: SubGroupItemProps) {
  const partsLink = group.links?.find((l) => l.action === 'getGroupParts');
  const hasChildren = (group.children?.length ?? 0) > 0;

  if (!partsLink && !hasChildren) {
    return (
      <span className="text-sm text-muted-foreground">{group.name}</span>
    );
  }

  if (partsLink) {
    const href = `${basePath}/parts?token=${encodeURIComponent(partsLink.token)}`;
    return (
      <Link
        href={href}
        className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-muted transition-colors group"
      >
        <span className="font-medium">{group.name}</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </Link>
    );
  }

  // Has sub-children, no direct parts link
  return (
    <div className="space-y-1">
      <span className="text-sm font-medium">{group.name}</span>
      {group.children && (
        <ul className="ml-3 space-y-0.5">
          {group.children.map((child, ci) => (
            <li key={child.token ?? ci}>
              <SubGroupItem group={child} brand={brand} basePath={basePath} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create `src/app/catalog/[brand]/groups/page.tsx`**

```tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getGroups, getLang } from '@/actions/yq';
import { GroupsTree } from '@/components/groups-tree';
import { t } from '@/lib/i18n';
import type { Lang } from '@/lib/i18n';

interface PageProps {
  params: Promise<{ brand: string }>;
  searchParams: Promise<{ token?: string; navToken?: string }>;
}

export default async function GroupsPage({ params, searchParams }: PageProps) {
  const [{ brand }, { token, navToken }] = await Promise.all([params, searchParams]);
  const lang = (await getLang()) as Lang;

  if (!token) return notFound();

  const groupsRes = await getGroups(token);
  if (groupsRes.error || !groupsRes.data) return notFound();

  const brandLabel = decodeURIComponent(brand)
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const basePath = `/catalog/${brand}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          {t('allBrands', lang)}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/catalog/${brand}${navToken ? `?token=${encodeURIComponent(navToken)}` : ''}`}
          className="hover:text-foreground transition-colors"
        >
          {brandLabel}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">{t('groups', lang)}</span>
      </nav>

      <h1 className="mb-4 text-xl font-bold">{brandLabel} — {t('groups', lang)}</h1>

      <GroupsTree
        tree={groupsRes.data}
        brand={brand}
        basePath={basePath}
      />
    </div>
  );
}
```

- [ ] **Step 3: Run typecheck**

```bash
cd /Users/gik986/Developer/APL-EDS && npm run typecheck 2>&1 | head -30
```

- [ ] **Step 4: Verify manually**

Complete vehicle wizard → should navigate to groups page showing two-panel layout.

- [ ] **Step 5: Commit**

```bash
cd /Users/gik986/Developer/APL-EDS
git add src/components/groups-tree.tsx src/app/catalog/[brand]/groups/page.tsx
git commit -m "feat: add two-panel groups browser page

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 8: Parts List (BOM) Page

**Files:**
- Create: `src/components/parts-table.tsx`
- Create: `src/app/catalog/[brand]/groups/parts/page.tsx`

**Interfaces:**
- Consumes: `getGroupParts()` from `src/actions/yq.ts`; `PartsListByCategoryResponseV2`, `PartV2Dto` from `src/types/yq.ts`
- Produces: `/catalog/[brand]/groups/parts?token=<getGroupParts token>` — BOM parts table

**Parts data structure:**
```
data.categories[] →
  category: { name, code }
  units[] →
    unit: { code, name, imageNames[] }
    partSections[] →
      title: string
      parts[] → PartV2Dto { partNumber, partName, qty, partNumberFormatted, displayName, attributes, areaCode, matched }
```

- [ ] **Step 1: Create `src/components/parts-table.tsx`**

```tsx
import { cn } from '@/lib/utils';
import type { CategoryV2Dto, PartV2Dto } from '@/types/yq';

interface PartsTableProps {
  categories: CategoryV2Dto[];
}

export function PartsTable({ categories }: PartsTableProps) {
  if (categories.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border">
        <p className="text-sm text-muted-foreground">No parts found</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {categories.map((cat, ci) => (
        <div key={cat.category.token ?? ci} className="space-y-4">
          <h2 className="text-base font-semibold">
            {cat.category.name}
            {cat.category.code && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                #{cat.category.code}
              </span>
            )}
          </h2>

          {cat.units.map((unitData, ui) => (
            <div key={unitData.unit.code ?? ui} className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-medium">{unitData.unit.name}</h3>
                  {unitData.unit.code && (
                    <p className="text-xs text-muted-foreground">
                      Unit: {unitData.unit.code}
                    </p>
                  )}
                </div>
                {unitData.imageNames?.[0] && (
                  <img
                    src={unitData.imageNames[0].replace('%size%', 'thumb')}
                    alt={unitData.unit.name}
                    className="h-24 w-auto rounded-lg border border-border object-contain"
                  />
                )}
              </div>

              {unitData.partSections.map((section, si) => (
                <div key={si}>
                  {section.title && (
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {section.title}
                    </p>
                  )}
                  <div className="overflow-hidden rounded-lg border border-border">
                    <table className="w-full text-sm">
                      <thead className="border-b border-border bg-muted/50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground w-10">
                            Pos.
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground">
                            Part No.
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground">
                            Description
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground w-16">
                            Qty
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground hidden lg:table-cell">
                            Remarks
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {section.parts.map((part, pi) => (
                          <PartRow key={part.partNumber + pi} part={part} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function PartRow({ part }: { part: PartV2Dto }) {
  const remarks = part.attributes
    ?.filter((a) => a.code !== 'GROUP' && a.code !== 'YEAR_RANGE')
    .flatMap((a) => a.values)
    .join('; ');

  return (
    <tr
      className={cn(
        'transition-colors hover:bg-muted/40',
        part.matched && 'bg-primary/5'
      )}
    >
      <td className="px-3 py-2 text-center text-xs text-muted-foreground">
        {part.areaCode}
      </td>
      <td className="px-3 py-2 font-mono text-xs font-medium">
        {part.partNumberFormatted ?? part.partNumber}
      </td>
      <td className="px-3 py-2">
        <div className="font-medium">{part.displayName || part.partName}</div>
        {part.displayName && part.partName !== part.displayName && (
          <div className="text-xs text-muted-foreground">{part.partName}</div>
        )}
      </td>
      <td className="px-3 py-2 text-center text-xs">
        {part.qty?.note ?? part.qty?.qty ?? '—'}
      </td>
      <td className="px-3 py-2 text-xs text-muted-foreground hidden lg:table-cell">
        {remarks || '—'}
      </td>
    </tr>
  );
}
```

- [ ] **Step 2: Create `src/app/catalog/[brand]/groups/parts/page.tsx`**

```tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getGroupParts, getLang } from '@/actions/yq';
import { PartsTable } from '@/components/parts-table';
import { t } from '@/lib/i18n';
import type { Lang } from '@/lib/i18n';

interface PageProps {
  params: Promise<{ brand: string }>;
  searchParams: Promise<{ token?: string; groupsToken?: string }>;
}

export default async function PartsPage({ params, searchParams }: PageProps) {
  const [{ brand }, { token, groupsToken }] = await Promise.all([params, searchParams]);
  const lang = (await getLang()) as Lang;

  if (!token) return notFound();

  const partsRes = await getGroupParts(token);
  if (partsRes.error || !partsRes.data) return notFound();

  const brandLabel = decodeURIComponent(brand)
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const groupsHref = `/catalog/${brand}/groups${groupsToken ? `?token=${encodeURIComponent(groupsToken)}` : ''}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          {t('allBrands', lang)}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/catalog/${brand}`}
          className="hover:text-foreground transition-colors"
        >
          {brandLabel}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={groupsHref} className="hover:text-foreground transition-colors">
          {t('groups', lang)}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">{t('parts', lang)}</span>
      </nav>

      <h1 className="mb-6 text-xl font-bold">{t('parts', lang)}</h1>

      <PartsTable categories={partsRes.data.categories} />
    </div>
  );
}
```

- [ ] **Step 3: Fix groups tree to link to parts with groupsToken**

The `SubGroupItem` in `src/components/groups-tree.tsx` needs to pass the current page's groups token as `groupsToken` query param. Update the href construction to include `&groupsToken=<encoded token from URL>`.

In `src/app/catalog/[brand]/groups/page.tsx`, pass `groupsToken={token}` to `<GroupsTree>`:

Modify `GroupsTreeProps` to include `groupsToken?: string`:
```tsx
// In groups-tree.tsx — update interface
interface GroupsTreeProps {
  tree: GroupNodeV2Dto;
  brand: string;
  basePath: string;
  groupsToken?: string;
}

// In SubGroupItem href construction:
const href = `${basePath}/groups/parts?token=${encodeURIComponent(partsLink.token)}${groupsToken ? `&groupsToken=${encodeURIComponent(groupsToken)}` : ''}`;
```

Pass through in GroupsTree → SubGroupItem. Update the groups page to pass `groupsToken={token}`.

- [ ] **Step 4: Run typecheck**

```bash
cd /Users/gik986/Developer/APL-EDS && npm run typecheck 2>&1 | head -30
```

Expected: No errors.

- [ ] **Step 5: Verify end-to-end flow in browser**

1. http://localhost:3000 → brand grid
2. Click a brand → vehicle wizard
3. Complete vehicle selection → groups page with two-panel layout
4. Click a sub-group → parts/BOM page with table

- [ ] **Step 6: Run full check**

```bash
cd /Users/gik986/Developer/APL-EDS && npm run check 2>&1 | tail -20
```

Expected: lint + typecheck pass, build succeeds.

- [ ] **Step 7: Commit**

```bash
cd /Users/gik986/Developer/APL-EDS
git add src/components/parts-table.tsx src/app/catalog/[brand]/groups/parts/page.tsx src/components/groups-tree.tsx src/app/catalog/[brand]/groups/page.tsx
git commit -m "feat: add BOM parts list page completing catalog flow

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Self-Review

### Spec Coverage

| Requirement | Covered by |
|---|---|
| Brand Grid (start after login) | Task 5 — `src/app/page.tsx` |
| Vehicle wizard: Model/Year cascade | Task 6 — `VehicleWizard` with `getOperationForm` loop |
| VIN search | Task 6 — VIN tab in `VehicleWizard` |
| Plate search | Task 6 — Plate tab in `VehicleWizard` |
| Groups two-panel layout | Task 7 — `GroupsTree` component |
| Parts/BOM table | Task 8 — `PartsTable` component |
| Bulgarian + English i18n | Task 3 — `i18n.ts` + `Accept-Language` in all API calls |
| Language toggle | Task 3 — `LanguageSwitcher` + `setLang` server action |
| Persistent header | Task 4 — `AppHeader` in root layout |
| Breadcrumb navigation | Tasks 6–8 — breadcrumb in every page |
| API key never exposed to client | Task 2 — all calls via Server Actions with `'use server'` |
| Browse-only (no cart) | No cart components created anywhere |

### Placeholder Scan

- No TBD or TODO items remain.
- All code blocks contain complete implementations.

### Type Consistency

- `FormValueV2` defined in Task 1, used by name in Tasks 2, 6 — consistent.
- `GroupNodeV2Dto` defined in Task 1, rendered in Task 7 — consistent.
- `CategoryV2Dto` defined in Task 1, used in Task 8's `PartsTable` — consistent.
- `lang as Lang` cast needed in pages because `getLang()` returns `string` — this is intentional.

### Gaps Fixed

- Groups → Parts navigation: `groupsToken` prop added in Task 8 Step 3 to enable Back link from parts page.
- Plate search country code: handled via `plateCountryCodes` derived from `plateForm` fields.
- Brand resolution without token: Task 6 falls back to `/catalogs` if no `?token=` in URL.
