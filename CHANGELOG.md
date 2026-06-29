# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This project started from the [ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template)
scaffold (squashed into the initial commit) and has since become a standalone product:
a Next.js clone of partslink24's UI backed by the YQ Service API, embedded as a module
inside Next Catalogue (TM1). There are no tagged releases yet — `[0.4.0]` groups all work
done so far by milestone.

## [Unreleased]

## [0.4.0] - 2026-06-29

### Added

- Full partslink24-style catalog flow: brand grid → vehicle wizard (VIN / plate / model
  cascade) → Categories (manufacturer-original tree) and Groups (TecDoc-universal) browsers
  → diagram-driven parts list (BOM) — all backed by the YQ Service API
- Diagram navigation: zoom/pan, accurate hotspot highlighting, REF callouts between related
  diagrams, vehicle identification sidebar
- Part-number search across catalogs (`getPartApplicability` / `findApplicableVehicles`),
  with engine/transmission code highlighting for partial vehicle matches
- Scan VIN from photo: client-side OCR (Tesseract.js) with a Google Cloud Vision fallback,
  clipboard paste support, and automatic HEIC/HEIF/any-format → JPEG normalization before OCR
- Client-side name search across the Groups/Categories tree, scoped to the selected group
- Brand logos, favicons, recent-vehicle history, multi-language UI (BG/EN)
- TM1 (Next Catalogue) iframe embedding: "OE aftermarket search" trigger via
  `postMessage`, last-visited-route persistence across TM1-driven iframe refreshes,
  copy-to-clipboard button hidden where clipboard access is blocked cross-origin
- Docker image build and publish to GHCR via GitHub Actions

### Fixed

- HTTP Basic auth (not `X-API-KEY`) for the YQ Service API
- Numerous breadcrumb, cache, and navigation-state bugs across the Categories/Groups flow
- Docker healthcheck failing on the production runner image
- Server Action body size limit causing VIN photo scan failures in production
- `tesseract.js` worker re-throw causing VIN scans on undecodable photos to hang forever
