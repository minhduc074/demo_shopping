# Stitch Commerce OS - Detailed Design

## Experience Map

The application is deliberately split into three domains:

- Authentication: login and register
- Commerce: homepage, search, detail, cart, checkout, orders
- Operations: admin dashboard and product management

This makes the demo useful for both buyer-facing and operator-facing storytelling.

## UI System

- Warm coral primary actions
- Rounded cards and spacious sections
- Database-driven category and product strips on the homepage
- Consistent form language across auth, cart, and checkout
- Dashboard panels that reuse the same brand palette with denser data presentation

## Technical Composition

- App Router pages are rendered from `source/src/app`.
- Domain queries are concentrated in `source/src/lib/store.ts`.
- Auth, Prisma, Stripe, and validators are isolated in `source/src/lib/`.
- Seed and schema artifacts are kept in `source/prisma/`.
- Original Stitch export assets stay under `source/.stitch/raw/` for traceability.

## Tradeoffs

- The project prioritizes complete demo coverage over production-hardening.
- Admin flows are presentation-grade rather than full CRUD operations in every direction.
- The webarchive and Stitch export are preserved as source material instead of being normalized into one asset pipeline.
