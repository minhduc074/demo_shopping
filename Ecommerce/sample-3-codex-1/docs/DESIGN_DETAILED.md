# Sông Hồng Core - Detailed Design

## Information Architecture

The experience is structured as a narrow demo funnel:

- Discovery: homepage and listing
- Consideration: product detail
- Conversion: cart and checkout
- Post-purchase context: account and success page

This keeps the surface area compact while still showing a believable commerce lifecycle.

## UI Composition

- Homepage uses an asymmetric hero plus masonry-like product rhythm.
- Cards combine image-led storytelling with concise metadata.
- Checkout pages simplify visual noise so the payment handoff stays clear.
- The same typography and color accents are reused across browse, cart, and account surfaces.

## Implementation Notes

- Server-rendered pages fetch data through Prisma helpers in `source/lib/catalog.ts`.
- Pricing, summaries, and fallback content are centralized in shared helpers.
- Stripe configuration is isolated in `source/lib/stripe.ts`.
- Catalog seed content and design assets are preserved under `source/prisma/` and `source/stitch-assets/`.

## Tradeoffs

- The project favors speed of demo delivery over deep feature breadth.
- Search, filtering, and admin workflows are intentionally light.
- A database fallback exists so the UI can still be shown in unstable local environments.
