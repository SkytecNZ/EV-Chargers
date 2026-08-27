# NZ EV Chargers

A Progressive Web App for EV owners to find charging stations while traveling around New Zealand.

- Map of NZ charger locations (clustered), sourced from [Open Charge Map](https://openchargemap.org/)
- Charger detail view — connectors, power (kW), network operator, status
- Filter by connector type and network operator
- Search by place name (via OpenStreetMap Nominatim)
- "Near me" using device geolocation
- Favorites, saved locally on the device
- Trip planner — enter a start and end location, see the driving distance/duration and route on the map, and see only the chargers along that route
- Installable PWA with offline caching of map tiles and the last-loaded charger data

## Tech Stack

- **React 19** + **TypeScript** + **Vite** — framework and build tooling
- **vite-plugin-pwa** — PWA support (manifest, service worker, offline caching)
- **Leaflet** + **react-leaflet** + **react-leaflet-cluster** — interactive map and marker clustering
- **@tanstack/react-query** — data fetching and caching
- **oxlint** — linting
- **netlify-cli** — local Netlify dev/deploy tooling

## Setup

1. Get a free API key from [openchargemap.org](https://openchargemap.org/site/loginprovider) (Account → Developer API Keys). **A key is required** — Open Charge Map now rejects unauthenticated requests with a 403.
2. Copy `.env.example` to `.env` and set `VITE_OCM_API_KEY`.
3. Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check and build for production
- `npm run preview` — preview the production build locally
- `npm run lint` — run Oxlint

## Pushing Changes to GitHub

After making local changes:

```bash
git status              # see what changed
git diff                # review the changes before staging
git add <files>          # or `git add .` to stage everything changed
git commit -m "describe your change"
git push
```

## Deploying to Netlify

This project deploys as a static site via the Netlify CLI (already added as a dev dependency), building locally so your `.env` key gets baked into the bundle automatically — no separate Netlify environment variable setup needed.

1. Make sure `.env` has a real `VITE_OCM_API_KEY` (see Setup above) and `npm run build` succeeds locally.
2. Log in to Netlify (opens your browser to authorize):
   ```bash
   npx netlify login
   ```
3. Link this folder to a Netlify site (creates a new one, or link an existing one) — it should auto-detect the build command/publish directory from `netlify.toml`:
   ```bash
   npx netlify init
   ```
4. Deploy a draft first to preview, then promote to production once you're happy:
   ```bash
   npx netlify deploy
   npx netlify deploy --prod
   ```
5. To check your live site's URL any time:
   ```bash
   npx netlify status
   ```

This app is currently published at: **https://nz-evchargers.netlify.app**

To publish an update after making changes, just repeat step 4 (`npx netlify deploy --prod`) — no need to redo login/init.

## Notes

- Chargers are fetched once per session for all of New Zealand and cached client-side (12h stale time) — filtering/search happens against that cached set, no extra API calls.
- Place search uses OpenStreetMap's Nominatim API, which has a fair-use rate limit; it's only used for panning the map, not for charger data.
- Routing (trip planner) uses OSRM's free public demo server, which is keyless but has no uptime SLA — fine for an MVP, but not guaranteed reliable at scale. If it becomes flaky, swap in a keyed provider like OpenRouteService following the same pattern as `VITE_OCM_API_KEY`.
- PWA icons in `public/` (`pwa-192.png`, `pwa-512.png`, `apple-touch-icon.png`, `favicon.svg`) are placeholders — swap them for real branding before wider distribution.
