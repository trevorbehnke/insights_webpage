# Address Insights

Live app: **[https://insights-webpage.vercel.app/](https://insights-webpage.vercel.app/)**

## Approach

I used a **spec-driven development workflow**: I authored a detailed technical specification (SPEC.md) covering architecture, data flow, scoring algorithms, and component structure before writing any implementation code. With that spec as a blueprint, I used Claude (Anthropic, Opus 4.6) as an implementation partner to execute against the plan while I directed decisions, reviewed output, and iterated on the results. This is increasingly how I work with AI tools, the spec is the artifact of my engineering thinking, and AI accelerates the build.

**What I personally authored:** The technical specification, all architectural decisions (slug-based URLs vs. database, Mapbox over Google Places, scoring weights and heuristics, API route design), feature prioritization, and final review of all code.

**What Claude assisted with:** Component scaffolding, boilerplate code generation, test suite setup, and iterative refinement of implementations I directed.

## Tech Stack

Next.js 16 (App Router), React 19, MUI 7, TypeScript, Mapbox GL + react-map-gl, deployed on Vercel.

## Assumptions

- **Scoring heuristics are intentionally simple.** The objective stated not to over-engineer the math, so I used weighted category counts with hand-tuned ideal thresholds rather than attempting distance-decay models or validated walkability algorithms. The goal was a clear, explainable methodology.
- **Mapbox SearchBox category search is the amenity source.** Mapbox's free tier was sufficient for this exercise. The SearchBox API returns up to 25 results per API call. Categories that map to multiple Mapbox IDs (e.g., "transit" queries bus_stop, public_transportation_station, and railway_station separately) effectively get a higher result ceiling, while single-ID categories like "restaurant" are capped at 25. In very dense urban areas, single-ID categories may plateau. I accepted this tradeoff rather than paginating or combining data sources, since the assignment prioritizes reasoning over authoritative scores.
- **No backend database.** All state lives in the URL (for shareability) or localStorage (for search history). This keeps the architecture simple and the deployment stateless, which felt appropriate for the scope.
- **The public Mapbox token is scoped.** The client-side token is restricted to map tile rendering. All geocoding and amenity API calls are proxied through Next.js API routes to keep the secret token server-side.

## Design Decisions

- **8 POI categories scored with independent weights** (grocery, restaurants, coffee, parks, schools, pharmacies, gyms, transit). Each category has an ideal count representing "good enough" density. This produces more nuanced scores than a raw amenity count, an area with 50 restaurants but no grocery store shouldn't score perfectly.
- **Driving score uses 3x the walking ideal counts at a 5-mile radius.** Drivers access more, but expectations scale with that access. This prevents the driving score from trivially maxing out everywhere.
- **Urban/suburban index uses amenity density per square mile** mapped to four labels (Urban >= 50, Dense Suburban >= 20, Suburban >= 8, Rural below). Simple threshold-based classification that produces intuitive results.
- **Slug-based shareable URLs** encode lat, lng, and address text directly in the path (`/address/40.7484,-73.9857,350-5th-Avenue-New-York-NY-10118`). Fresh amenity data is fetched on every page load using the embedded coordinates, so shared links always show current data without needing a database.
- **Score Breakdown accordion** on the insights page shows per-category contributions to the walking and driving scores, so users can see exactly how the score was derived rather than just a number.
- **Dark mode toggle and responsive layout** using MUI theming. Score cards stack on mobile, map and amenity lists are full-width.

## Testing

Unit tests cover the three core logic modules using Jest:

- **`lib/scoring.ts`** (~10 tests): Empty amenities, full coverage, partial scores, driving score proximity decay, urban index threshold boundaries, and a structural check that category weights sum to 100.
- **`lib/slugs.ts`** (~4 tests): Round-trip encode/decode fidelity, special character handling, negative coordinates.
- **`lib/history.ts`** (~4 tests): Empty state, entry persistence, duplicate replacement, max entry enforcement.

I focused testing on pure logic functions tied directly to the assignment's required features. API routes (thin Mapbox proxies) and UI components were validated manually, with more time, I'd add React Testing Library coverage for the insights page data flow.

## What I'd Improve With More Time

- Paginate Mapbox SearchBox results to avoid the 25-result-per-category cap in dense areas
- Add distance-decay weighting so a grocery store 0.1 mi away contributes more than one at 0.9 mi
- E2E tests with Playwright for the full search-to-insights flow
- Error boundaries and loading skeletons for a more resilient UX
- Rate limiting on the API routes
