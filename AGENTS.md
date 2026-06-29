<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# APL-EDS — OEM Parts Catalog

## What This Is
A Next.js clone of [partslink24](https://www.partslink24.com)'s UI and navigation flow,
backed by the YQ Service API instead of partslink24's own backend. Built with Claude Code
using the `/clone-website` skill for the initial reverse-engineering pass; now in active
production development (deployed to `apl-eds.autoplus.bg`, embedded as a module in Next
Catalogue/TM1).

## Tech Stack
- **Framework:** Next.js 16 (App Router, React 19, TypeScript strict)
- **UI:** shadcn/ui (Radix primitives, Tailwind CSS v4, `cn()` utility)
- **Icons:** Lucide React, plus extracted SVGs (brand logos, etc.)
- **Styling:** Tailwind CSS v4 with oklch design tokens
- **Deployment:** Docker image on GHCR, deployed to `apl-eds.autoplus.bg`

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — ESLint check
- `npm run typecheck` — TypeScript check
- `npm run check` — Run lint + typecheck + build

## Code Style
- TypeScript strict mode, no `any`
- Named exports, PascalCase components, camelCase utils
- Tailwind utility classes, no inline styles
- 2-space indentation
- Responsive: mobile-first

## Design Principles
- **Pixel-perfect emulation** — match partslink24's spacing, colors, typography, and flow exactly when extending the catalog
- **No personal aesthetic changes** — match partslink24 1:1; this is a clone, not a redesign
- **Real content** — use actual text/assets from YQ Service responses, not placeholders
- **Beauty-first** — every pixel matters

## Project Structure
```
src/
  app/              # Next.js routes
  components/       # React components
    ui/             # shadcn/ui primitives
    icons.tsx       # Extracted SVG icons as React components
  lib/
    utils.ts        # cn() utility (shadcn)
  types/            # TypeScript interfaces
  hooks/            # Custom React hooks
public/
  images/           # Downloaded images from target site
  videos/           # Downloaded videos from target site
  seo/              # Favicons, OG images, webmanifest
docs/
  research/         # Inspection output (design tokens, components, layout)
  design-references/ # Screenshots and visual references
```

## MOST IMPORTANT NOTES
- When launching Claude Code agent teams, ALWAYS have each teammate work in their own worktree branch and merge everyone's work at the end, resolving any merge conflicts smartly since you are basically serving the orchestrator role and have full context to our goals, work given, work achieved, and desired outcomes.

@docs/research/INSPECTION_GUIDE.md
