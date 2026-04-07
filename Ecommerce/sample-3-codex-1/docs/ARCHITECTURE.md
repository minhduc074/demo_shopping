# Sông Hồng Core - Architecture Overview

## Project Summary

Sông Hồng Core is an editorial-style e-commerce storefront rebuilt from Stitch assets into a real Next.js application. The current implementation focuses on a premium browsing flow, cart and checkout journey, and a lightweight account area backed by Prisma, PostgreSQL, and Stripe.

## Runtime Stack

- Frontend and backend: Next.js App Router with TypeScript
- Data access: Prisma ORM
- Database: PostgreSQL
- Payments: Stripe Checkout
- Fallback mode: local demo data when the database is not reachable

## Main Application Areas

- `source/app/page.tsx`: editorial homepage with highlighted products and CTA rails
- `source/app/products`: catalog and product detail journey
- `source/app/cart`: cart review flow
- `source/app/checkout`: checkout and success states
- `source/app/account`: account summary
- `source/app/api/products`: backend JSON endpoint for catalog access

## Data Model

The Prisma schema centers on four entities:

- `Product`: catalog source of truth, including gallery, tags, pricing, and editorial metadata
- `Cart` and `CartItem`: persistent cart keyed by token
- `Order` and `OrderItem`: checkout output linked to Stripe session identifiers

## Folder Convention

This sample now follows the same artifact layout as `sample-1-github-copilot`:

- `demo/`: screenshots and demo README
- `docs/`: presentation-facing documentation
- `slide/`: presentation artifacts
- `source/`: runnable application source code and technical assets
