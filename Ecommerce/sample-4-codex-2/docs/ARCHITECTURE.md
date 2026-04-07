# Stitch Commerce OS - Architecture Overview

## Project Summary

Stitch Commerce OS is a fuller commerce demo than sample 3. It includes a customer storefront, authentication pages, order history, an admin dashboard, and product management, all translated from Stitch screens into a live Next.js application backed by Prisma and PostgreSQL.

## Runtime Stack

- Frontend and backend: Next.js 14 App Router with TypeScript
- ORM: Prisma
- Database: PostgreSQL
- Payments: Stripe Checkout
- Styling: Tailwind CSS
- Validation and domain helpers: `zod`, utility libraries, server-side store helpers

## Application Modules

- `source/src/app`: customer and admin routes
- `source/src/components`: commerce and form primitives
- `source/src/lib/store.ts`: cached catalog, cart, checkout, orders, and dashboard queries
- `source/src/lib/auth.ts`: session and user resolution
- `source/prisma/schema.prisma`: domain model and persistence rules
- `source/.stitch/raw`: original HTML, metadata, and screenshots from the design source

## Implemented Flows

- Homepage with featured categories and featured products
- Search and category-oriented browsing
- Product detail and related products
- Cart and checkout
- Login and register screens
- Order history
- Admin dashboard and product management

## Data Model

The schema covers a practical commerce baseline:

- `User` and `Session`: authentication and session ownership
- `Category` and `Product`: catalog taxonomy and product content
- `Cart` and `CartItem`: active shopping state
- `Order` and `OrderItem`: order lifecycle and totals
- Enum-backed status fields for product, order, payment, and role

## Data Flow

1. Server components load data through cached Prisma queries in `source/src/lib/store.ts`.
2. Catalog, search, cart, order, and admin views all resolve from the same database.
3. Checkout calls Stripe using `source/src/lib/stripe.ts`.
4. Order records persist totals, shipping details, and Stripe checkout identifiers.

## Folder Convention

This project now mirrors the artifact-oriented structure used by `sample-1-github-copilot`:

- `demo/`: image gallery for showcase screenshots
- `docs/`: presentation and overview documentation
- `slide/`: generated presentation assets
- `source/`: runnable application and original design references

## Source Assets

The original exported brief and screenshots remain available from:

- `docs/docs.webarchive`
- `source/.stitch/raw/`
