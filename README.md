# Luggage Depot OS

**Luggage Depot OS** is a professional inventory, pricing, reporting, and AI ordering platform for [Luggage Depot Inc.](https://luggagedepot.ca) — a multi-location luggage retailer in Calgary.

This app helps the owner track inventory across stores, understand landed cost and retail pricing, filter products by brand/color/size/price, review margins, forecast sales, and prepare inventory orders — replacing slow Excel workflows with a fast, reliable system.

## Approach

### Dummy-data-first (Phase 2+)

The app is built **dummy-data-first** for development and client demos. Realistic seed data will power screens before any live client data is connected. This keeps development fast while the UI and business logic mature.

### Mobile + web

Runs on:

- **iOS / Android** via Expo Go
- **Web browser** locally (`npm run web`)
- **Vercel** via static export (`npm run build:web`)

Platform-aware code is used where needed (e.g. `expo-secure-store` on native, `localStorage` on web via `.web.ts` files).

### Future Supabase migration

The architecture is designed to migrate from local/dummy data services to **Supabase** (PostgreSQL + auth + RLS) without rewriting screens:

| Layer | Purpose |
|-------|---------|
| `app/` | Expo Router screens and navigation |
| `components/` | Shared UI components |
| `features/` | Feature modules (UI + hooks per domain) |
| `services/` | Data access (dummy now, Supabase later) |
| `data/` | Seed payloads and fixtures |
| `schemas/` | Zod validation schemas |
| `types/` | Shared TypeScript types |
| `utils/` | Platform helpers and utilities |
| `constants/` | Design tokens and navigation |

## Tech stack

- **Expo SDK 54** (pinned at `54.0.0`)
- **Expo Router** with drawer navigation
- **TypeScript**
- **React Native** for iOS, Android, and web

## Prerequisites

- Node.js 20+
- npm
- [Expo Go](https://expo.dev/go) on your phone (for mobile testing)

## Setup

```bash
git clone <repository-url>
cd luggage_depot_demo
npm install
```

## Run locally

```bash
# Start dev server (then press w / i / a for web / iOS / Android)
npm start

# Or directly:
npm run web
npm run ios
npm run android
```

Open:

- **Web:** http://localhost:8081
- **Mobile:** scan the QR code in Expo Go

## Test web build (Vercel preview)

```bash
npm run build:web
npx serve dist
```

The static site is output to `dist/`.

## Deploy to Vercel

1. Connect this repository to [Vercel](https://vercel.com).
2. Vercel reads `vercel.json` automatically:
   - **Build command:** `npm run build:web`
   - **Output directory:** `dist`
3. Deploy. Client-side routes fall back to `index.html` via rewrites.

To redeploy after changes:

```bash
git push
```

Or trigger a manual redeploy from the Vercel dashboard.

## Project health

```bash
npm run typecheck
npm run lint
npx expo-doctor
```

## Current phase

**Phase 1 — Foundation** (complete)

- Design system and shared components
- Drawer app shell with route stubs
- Folder architecture for features, services, data, schemas
- Web export and Vercel config

**Phase 2** will add dummy data, product models, and first real screens.

## License

Private — Luggage Depot Inc.
