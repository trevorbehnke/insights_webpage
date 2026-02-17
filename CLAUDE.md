# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start dev server at localhost:3000
- `npm run build` — Production build (also serves as type-check; no separate tsc script)
- `npm run lint` — ESLint via Next.js
- `npm test` — Jest unit tests

## Architecture

Next.js 16 App Router application that displays neighborhood walkability/drivability scores for any US address. React 19, TypeScript (strict), MUI 7, Mapbox GL.

### Data Flow

1. User searches address → `SearchBar` calls `/api/geocode` → Mapbox Geocoding v6
2. Selection navigates to `/address/{lat},{lng},{encoded-address}` (slug encodes all state; no database)
3. Insights page fetches `/api/amenities?lat=...&lng=...` → Mapbox SearchBox v1 category endpoint searches 8 POI categories at 1mi and 5mi radii
4. Client-side `lib/scoring.ts` computes walking score (1mi), driving score (5mi), and urban index from returned amenities
5. Results rendered as score dials, interactive map with markers, and accordion amenity list

### Key Directories

- `app/` — Pages and API routes (App Router)
- `app/api/geocode/`, `app/api/amenities/`, `app/api/reverse-geocode/` — Server-side API wrappers that keep `MAPBOX_ACCESS_TOKEN` secret
- `components/` — React components (SearchBar, ScoreDial, AmenityMap, AmenityList, UrbanIndex, etc.)
- `lib/` — Shared utilities: `mapbox.ts` (API calls), `scoring.ts` (score algorithms), `slugs.ts` (URL encoding), `history.ts` (localStorage), `types.ts`, `theme.ts`
- `__tests__/` — Jest unit tests for `scoring.ts`, `slugs.ts`, `history.ts`

### Scoring System (`lib/scoring.ts`)

- **Walking score**: weighted sum across 8 categories within 1mi. Formula: `sum(min(count/ideal, 1.0) * weight)`, weights sum to 100.
- **Driving score**: proximity-based at 5mi radius. For each category, finds nearest amenity; formula: `max(0, 1 - dist/5) * weight`. Closer = higher score; 5mi+ = 0.
- **Urban index**: density = walking amenity count / π; thresholds at 30 (Urban), 15 (Dense Suburban), 6 (Suburban), <6 (Rural).

### Mapbox API Usage (`lib/mapbox.ts`)

- `forwardGeocode` / `reverseGeocode` — Geocoding v6 endpoints
- `searchAmenities` — SearchBox v1 `/category/{id}` endpoint with limit=25, bbox filtering, proximity sorting, haversine distance calc, deduplication by name+category+coordinates

## Environment Variables

- `MAPBOX_ACCESS_TOKEN` — Server-only secret token (used in API routes)
- `NEXT_PUBLIC_MAPBOX_TOKEN` — Client-safe token for map rendering (styles:read, fonts:read, tiles:read scopes only)

## Path Aliases

`@/*` maps to project root (configured in tsconfig.json).
