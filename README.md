# APL-EDS — OEM Parts Catalog

A clone of [partslink24](https://www.partslink24.com)'s UI and navigation flow, powered by
the [YQ Service](https://oem-api.yqservice.eu) API as the data backend. Select a brand,
identify a vehicle (VIN or a cascading wizard), browse parts diagrams by group/category, and
search by part number — without partslink24's own backend.

> Built on top of the [ai-website-cloner-template](README.init.md) scaffold (Next.js 16 +
> shadcn/ui + Tailwind v4). See that file for the original template's own documentation.

## Tech Stack

- **Next.js 16** — App Router, React 19, TypeScript strict
- **shadcn/ui** — Tailwind CSS v4, `cn()` utility
- **YQ Service API** — vehicle/parts data, token-based navigation

## Prerequisites

- [Node.js](https://nodejs.org/) 24+
- A YQ Service API key

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure your API key** — create `.env.local` in the project root:

   ```bash
   YQ_API_KEY=your-yq-service-api-key
   ```

3. **Start the dev server**

   ```bash
   npm run dev
   ```

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint        # ESLint check
npm run typecheck  # TypeScript check
npm run check       # Run lint + typecheck + build
```

## How the App Maps to YQ Service

| Page                                                 | YQ Service call                                                      |
| ---------------------------------------------------- | -------------------------------------------------------------------- |
| `/` — Brand Grid                                     | `POST /restApi/v2/catalogs`                                          |
| `/catalog/[brand]` — vehicle identification          | wizard form (`getOperationForm`) or VIN search (`findVehicle`)       |
| `/catalog/[brand]/groups` — Groups / Categories tabs | `getGroups` (TecDoc tree) or `getNavigationTree` (manufacturer tree) |
| `/catalog/[brand]/groups/parts` — parts diagram/BOM  | `getGroupParts` / `getUnitParts` / `getPartApplicability`            |

Not every brand exposes every operation — some only support VIN or part-number search
(no cascading wizard). The catalog page degrades gracefully when a form is unavailable.

## Docker

```bash
docker compose up app --build   # build and run the production image
docker compose up dev --build   # run in dev mode (hot reload) on port 3001
```

`docker-compose.yml` is a generic, standalone-buildable template. Production-specific
deployment config (reverse proxy, TLS, access restrictions) is expected to live in a local,
gitignored `docker-compose.prod.yml` override — not in this file.

A GitHub Actions workflow (`.github/workflows/docker.yml`) builds and publishes the image to
GHCR on every push to `master` or on tags.

## License

Proprietary — UNLICENSED, all rights reserved.
