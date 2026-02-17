# Address Insights App — Technical Specification

## Tech Stack

| Layer | Choice | Version |
|-------|--------|---------|
| Framework | Next.js (App Router) | 16 |
| UI Library | React | 19 |
| Component Kit | MUI (Material UI) | 7 |
| Map | mapbox-gl + react-map-gl | latest |
| Language | TypeScript | 5.7 |
| Runtime | Node.js | 22 LTS |
| Testing | Jest + ts-jest | 30 |
| Deployment | Vercel | — |

---

## Project Structure

```
insights/
├── app/
│   ├── layout.tsx              # Root layout, MUI ThemeProvider, CssBaseline
│   ├── page.tsx                # Home — search bar + search history
│   ├── address/
│   │   └── [slug]/
│   │       └── page.tsx        # Insights page for a given address
│   └── api/
│       ├── geocode/
│       │   └── route.ts        # Forward geocode (address → coords + amenities)
│       ├── amenities/
│       │   └── route.ts        # POI/amenity search around coordinates
│       └── reverse-geocode/
│           └── route.ts        # Coords → formatted address (for shared URLs)
├── components/
│   ├── SearchBar.tsx           # Autocomplete address input
│   ├── SearchHistory.tsx       # Recent searches list
│   ├── ScoreDial.tsx           # Circular gauge for walking/driving scores
│   ├── UrbanIndex.tsx          # Urban/suburban label display
│   ├── AmenityMap.tsx          # Mapbox GL map with amenity markers
│   ├── AmenityList.tsx         # Grouped accordion list of nearby amenities
│   └── ThemeRegistry.tsx       # MUI + Emotion SSR cache setup
├── lib/
│   ├── mapbox.ts               # Server-side Mapbox API helpers
│   ├── scoring.ts              # Walking score, driving score, urban index
│   ├── slugs.ts                # Encode/decode address slugs
│   └── history.ts              # localStorage search history helpers
├── __tests__/
│   ├── scoring.test.ts          # Walking/driving score & urban index tests
│   ├── slugs.test.ts            # Slug encode/decode round-trip tests
│   └── history.test.ts          # localStorage history tests
├── public/
├── .env.local                  # MAPBOX_ACCESS_TOKEN, NEXT_PUBLIC_MAPBOX_TOKEN
├── jest.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## Pages

### `/` — Search Home

- Full-width centered search bar with Mapbox address autocomplete.
- Below the search bar: **Search History** list (most recent first, max 10).
- On selecting an address, navigate to `/address/[slug]`.

### `/address/[slug]` — Insights Page

The slug encodes latitude, longitude, and address text so the page is fully shareable without a database.

**Slug format:** `{lat},{lng},{url-encoded-address}`
Example: `40.7484,-73.9857,350-5th-Ave-New-York-NY-10118`

**Layout (top to bottom):**

1. **Header** — Address text, back-to-search link.
2. **Score Cards Row** — Three cards side-by-side (responsive, stacks on mobile):
   - Walking Score (0-100 dial)
   - Driving Score (0-100 dial)
   - Urban/Suburban Index (label + icon)
3. **Map** — Interactive Mapbox GL map centered on address, markers for amenities color-coded by category.
4. **Amenity Details** — MUI Accordion groups (Food & Drink, Shopping, Parks, Schools, Transit, etc.) each listing amenities with name and distance.

On mount the page:
1. Decodes the slug to get lat, lng, address.
2. Calls `GET /api/amenities?lat=...&lng=...` to fetch nearby POIs.
3. Computes scores client-side from the amenity data.
4. Saves the address to search history.

---

## API Routes

All API routes run server-side to keep the secret `MAPBOX_ACCESS_TOKEN` hidden from the client.

### `GET /api/geocode?q={address}`

- Proxies **Mapbox Geocoding API** (`mapbox.places`).
- Returns: `{ results: [{ place_name, lat, lng }] }`
- Used by the search autocomplete.

### `GET /api/amenities?lat={lat}&lng={lng}`

- Calls **Mapbox Tilequery API** or **Geocoding API** with POI category searches at two radii:
  - **1 mile** (walking) — categories: restaurant, cafe, bar, grocery, park, school, pharmacy, transit
  - **5 miles** (driving) — same categories, broader net
- Returns: `{ walking: Amenity[], driving: Amenity[] }`
- Each `Amenity`: `{ name, category, lat, lng, distance_mi }`

### `GET /api/reverse-geocode?lat={lat}&lng={lng}`

- Proxies **Mapbox Reverse Geocoding**.
- Returns: `{ address: string }`
- Fallback for shared URLs where address text is unavailable.

---

## Scoring Algorithms

All scoring lives in `lib/scoring.ts` and runs client-side after amenity data is fetched.

### Walking Score (0-100)

```
Radius: 1 mile
13 categories & weights (sum to 100):
  grocery:15  restaurant:12  cafe:7   transit:15  park:8
  school:7    pharmacy:7     shopping:5  gym:5   bank:5
  entertainment:4  medical:5  bar:5

Ideal counts (saturation threshold per category):
  grocery:2  restaurant:4  cafe:2  transit:3  park:2  school:2
  pharmacy:1  shopping:2  gym:1  bank:1  entertainment:1  medical:1  bar:2

For each category:
  categoryScore = min(count_in_radius / ideal_count, 1.0) * weight

walkingScore = sum(categoryScores)
Clamp to 0-100, rounded.
```

### Driving Score (0-100)

Proximity-based scoring at 5-mile radius. Uses distance to nearest amenity per category rather than counts.

```
For each category:
  Find nearest amenity distance (miles)
  categoryScore = max(0, 1 - distance / 5) * weight

drivingScore = sum(categoryScores)
Clamp to 0-100, rounded.
```

Closer amenities score higher; anything at 5mi or beyond contributes 0.

### Urban/Suburban Index

```
density = total_amenities_within_1mi / (π * 1²)   // amenities per sq mile

if density >= 30  → "Urban"
if density >= 15  → "Dense Suburban"
if density >= 6   → "Suburban"
else              → "Rural"
```

Displayed as a label with a corresponding icon/color.

---

## UI / UX Details

### Theme

- MUI `createTheme` with a clean palette (primary: indigo-ish, secondary: teal).
- `CssBaseline` for normalization.
- Responsive breakpoints: mobile-first, cards stack below `sm`.

### Score Dials

- Circular progress (MUI `CircularProgress` variant or a lightweight SVG ring).
- Numeric score centered inside.
- Color gradient: red (0-40) → yellow (40-70) → green (70-100).

### Map

- `react-map-gl` `<Map>` component with `NEXT_PUBLIC_MAPBOX_TOKEN`.
- Address pin in the center (distinct color/size).
- Amenity markers color-coded by category with a legend.
- Popup on marker click showing amenity name + category.
- `NavigationControl` for zoom.

### Amenity Accordions

- Grouped by category.
- Each item shows name and distance (e.g., "0.3 mi").
- Sorted by distance ascending within each group.

---

## Search History

Managed in `lib/history.ts` using `localStorage`.

```
Key: "address-insights-history"
Value: JSON array of { address, lat, lng, slug, timestamp }
```

**Rules:**
- Max 10 entries.
- Newest first.
- Deduplicate by slug (if same address searched again, move it to top, update timestamp).
- Displayed on the home page as clickable chips/list items that navigate to the insights page.

---

## Shareable URLs

The slug in `/address/[slug]` contains all data needed to reconstruct the page:

```
/address/40.7484,-73.9857,350-5th-Ave-New-York-NY-10118
```

Encoding (`lib/slugs.ts`):
- `encodeSlug(lat, lng, address)` → comma-joined, address part has spaces→dashes, URI-encoded.
- `decodeSlug(slug)` → `{ lat, lng, address }`.

No database required. The page fetches fresh amenity data on every load using the coordinates from the slug.

---

## Environment Variables

| Variable | Scope | Purpose |
|----------|-------|---------|
| `MAPBOX_ACCESS_TOKEN` | Server only | Used in API routes to call Mapbox APIs. Secret, never exposed to client. |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Client + Server | A **scoped public token** (restricted to map tiles + styles) used by `react-map-gl`. Safe to expose. |

Create two tokens in the Mapbox dashboard:
1. **Secret token** — all API scopes needed (geocoding, tilequery).
2. **Public token** — scoped to `styles:read`, `fonts:read`, `tiles:read` only, with URL restrictions.

---

## Deployment

- **Platform:** Vercel
- **Build:** `next build` (standard)
- **Environment:** Set both Mapbox tokens in Vercel project settings.
- **No database** — all state is in the URL or localStorage.

---

## Implementation Sequence

Target: working app in 1-3 hours.

| Step | Task | Est. |
|------|------|------|
| 1 | Scaffold Next.js 16 + TypeScript, install deps (MUI, react-map-gl, mapbox-gl) | 10 min |
| 2 | MUI theme + root layout (`ThemeRegistry`, `CssBaseline`) | 10 min |
| 3 | `/api/geocode` route — proxy Mapbox forward geocoding | 10 min |
| 4 | Home page — `SearchBar` with autocomplete, navigation on select | 15 min |
| 5 | `/api/amenities` route — fetch POIs at two radii | 15 min |
| 6 | `lib/scoring.ts` — walking score, driving score, urban index | 10 min |
| 7 | `lib/slugs.ts` — encode/decode slug helpers | 5 min |
| 8 | `/address/[slug]` page — fetch amenities, compute scores, render score dials + amenity list | 25 min |
| 9 | `AmenityMap` — Mapbox GL map with markers + popups | 20 min |
| 10 | Search history (localStorage) + display on home page | 10 min |

**Total: ~130 min** (well within the 1-3 hour window, with buffer for polish and deployment).

---

## Feature Checklist (vs OBJECTIVE.md)

| # | Required Feature | Addressed By |
|---|-----------------|--------------|
| 1 | Walking Score | `lib/scoring.ts` → ScoreDial on insights page |
| 2 | Driving Score | `lib/scoring.ts` → ScoreDial on insights page |
| 3 | Urban/Suburban Index | `lib/scoring.ts` → UrbanIndex component |
| 4 | Search History | `lib/history.ts` + localStorage, shown on home page |
| 5 | Render Map | `AmenityMap` with react-map-gl, markers for amenities |
| 6 | Shareable Page | Slug-based URL with coords + address, no DB needed |
| 7 | Other interesting features | Category-grouped amenity details, color-coded score dials, responsive design |
