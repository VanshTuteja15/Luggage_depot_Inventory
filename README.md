# Luggage Depot OS

**Luggage Depot OS** is a commercial retail operating system for [Luggage Depot Inc.](https://luggagedepot.ca) — inventory, pricing, forecasting, and purchase planning for a multi-location luggage retailer in Calgary.

Clover POS remains the checkout system. Luggage Depot OS is the business layer above it.

```
Supplier → Luggage Depot OS → Inventory / Pricing / Forecasting / Orders → Clover POS → Customer
```

## Architecture

### Variant-first inventory model

Stock is **never** tracked at the parent product level. Every sellable unit is a **product variant**:

```
Product (Samsonite Omni PC)
  ├── Variant: Black / 20"  (SKU, barcode, landed cost, retail price)
  ├── Variant: Black / 24"
  └── Variant: Navy / 20"
```

| Layer | Responsibility |
|-------|----------------|
| `types/domain.ts` | Domain models and service result types |
| `schemas/` | Zod validation for seed data and future imports |
| `data/seed/` | Realistic dummy data generation |
| `repositories/` | Data access interfaces + in-memory implementation |
| `services/` | Business logic (pricing, forecast, dashboard, filters) |
| `features/` | Screen-level UI and hooks (no business logic in components) |
| `components/` | Shared design-system UI |
| `app/` | Expo Router routes |

### Dummy-data-first

Phase 2 uses an **in-memory repository** backed by a seeded dataset:

- 8 Calgary-area locations
- 10 real luggage brands
- 25 parent products
- 75–120 variants (color × size matrix)
- 90 days of Clover-shaped sales history
- Stock movements and per-location inventory

Replace `repositories/in-memory-retail-repository.ts` with Supabase repositories later — **screens and services stay the same**.

### Future Supabase migration

1. Mirror domain tables: `products`, `product_variants`, `inventory`, `stock_movements`, `sales_history`
2. Implement `RetailRepository` against Supabase client
3. Swap `getRetailRepository()` factory — no UI changes required
4. Add RLS per role (`types/roles.ts`)

### Future Clover integration

Clover is isolated behind interfaces in `services/clover/`:

- `CloverSalesAdapter` — future API sync
- `SalesCsvMapper` — CSV import from Clover exports
- `SalesHistoryRecord.source = 'clover'` when live

**Do not** call Clover from screens. Only adapters and import services.

### Future AI roadmap

Phase 2 forecasting is **rule-based** (average daily sales → days remaining → reorder quantity → risk level).

Planned AI enhancements (not built yet):

- Natural-language inventory search
- Demand forecasting with seasonality
- Reorder recommendations with supplier lead times
- "Ask inventory" assistant
- Anomaly detection on stock movements

## Tech stack

- Expo SDK **54.0.0** (pinned)
- Expo Router + drawer navigation
- TypeScript + Zod
- iOS, Android (Expo Go), and web (static export)

## Setup

```bash
npm install
npm start
```

| Command | Purpose |
|---------|---------|
| `npm start` | Dev server (Expo Go + web) |
| `npm run web` | Web browser only |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint |
| `npm run build:web` | Static export to `dist/` |
| `npx expo-doctor` | Expo health check |

## Test locally

```bash
npm start
```

- Press **w** for web → Dashboard shows live metrics from dummy data
- Scan QR in **Expo Go** for iOS/Android
- Open drawer → all routes work; only Dashboard has real data in Phase 2

## Test web build

```bash
npm run build:web
npx serve dist
```

## Deploy to Vercel

`vercel.json` is configured:

- Build: `npm run build:web`
- Output: `dist`

Push to Git or redeploy from the Vercel dashboard.

## Project structure

```
app/                 # Routes
components/          # Shared UI
constants/           # Theme, navigation
data/seed/           # Dummy data generator
features/            # Feature modules (dashboard, app shell)
repositories/        # Data access layer
schemas/             # Zod schemas
services/            # Business logic
types/               # Domain types
utils/               # Formatting, IDs, platform helpers
```

## Current phase

**Phase 2 — Business data layer** (complete)

- Variant-first domain model
- Seeded dummy database
- Pricing, forecast, filter, and dashboard services
- Clover-ready interfaces
- Live dashboard UI

**Phase 3+** will add authentication, inventory screens, and Supabase.

## License

Private — Luggage Depot Inc.
