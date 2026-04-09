# The Curator

Production-style e-commerce app built with Next.js 14 App Router, TypeScript, Prisma/PostgreSQL, database-backed password auth, and Stripe Checkout Sessions. The UI was rebuilt from Stitch exports, and raw Stitch HTML/screenshots/assets are stored locally under `.stitch/` and `public/stitch-assets/`.

## Stack

- Next.js 14 + TypeScript
- Prisma + PostgreSQL
- Custom email/password auth with hash + salt stored in Postgres
- Stripe Checkout + webhook finalization
- Tailwind CSS

## Local Setup

1. Copy `.env.example` to `.env.local`.
2. Fill in a real PostgreSQL `DATABASE_URL`.
3. Set `AUTH_SECRET` to a long random string.
4. Keep or replace the provided Stripe test keys.

## Commands

```bash
npm install
npm run stitch:pull
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Validation commands:

```bash
npm run lint
npm run typecheck
npm run build
```

## Stitch Assets

- Raw HTML: `.stitch/raw/html`
- Screen screenshots: `.stitch/raw/screenshots`
- Extracted hosted images: `public/stitch-assets`
- Project manifest: `.stitch/project.json`

## Auth

Accounts use email/password. Passwords are stored as a derived hash plus a per-user salt in `UserProfile`.

Seeded credentials:

- Admin: `admin@futurelink.local` / `admin12345`
- Customer: `customer@futurelink.local` / `customer12345`

## Stripe Flow

1. Customer adds DB-backed products to cart.
2. `POST /api/checkout/session` creates a Stripe Checkout Session from authoritative DB pricing.
3. A pending order and payment record are written to Postgres.
4. `POST /api/stripe/webhook` marks payment succeeded, marks order paid, decrements inventory, and clears the cart.

## Routes

- `/`
- `/search`
- `/products/[slug]`
- `/cart`
- `/checkout`
- `/orders`
- `/login`
- `/register`
- `/admin`
- `/admin/products`
