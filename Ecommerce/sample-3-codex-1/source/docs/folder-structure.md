# Recommended Folder Structure

```text
song-hong-core/
├── app/                         # Next.js App Router entrypoints
│   ├── (storefront)/            # Public customer routes
│   │   ├── page.tsx             # Home page
│   │   ├── products/            # Listing/detail pages
│   │   ├── cart/                # Cart UI
│   │   ├── checkout/            # Checkout and success pages
│   │   └── account/             # Customer account
│   ├── admin/                   # Admin routes and dashboards
│   ├── api/                     # Route handlers grouped by domain
│   │   ├── auth/
│   │   ├── products/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── orders/
│   │   └── webhooks/
│   ├── actions/                 # Server Actions grouped by use case
│   ├── layout.tsx               # Global shell
│   └── globals.css              # Design tokens and global styles
├── components/                  # Reusable UI components
│   ├── ui/                      # Generic buttons, inputs, modals
│   ├── product/                 # Product-specific UI blocks
│   ├── cart/                    # Cart widgets
│   ├── checkout/                # Checkout form/summary UI
│   └── admin/                   # Admin UI components
├── modules/                     # Domain-oriented business logic
│   ├── auth/
│   │   ├── controller.ts        # API/controller entrypoints
│   │   ├── service.ts           # Auth business logic
│   │   ├── repository.ts        # Persistence abstraction
│   │   ├── schema.ts            # Validation schemas
│   │   └── types.ts             # DTOs and shared types
│   ├── catalog/
│   ├── cart/
│   ├── checkout/
│   ├── order/
│   ├── payment/
│   ├── notification/
│   └── audit/
├── lib/                         # Shared infrastructure and adapters
│   ├── db.ts                    # Prisma/database bootstrap
│   ├── redis.ts                 # Redis adapter
│   ├── stripe.ts                # Stripe client
│   ├── logger.ts                # Structured logging
│   ├── auth.ts                  # Session helpers and guards
│   ├── cache.ts                 # Cache helpers
│   └── env.ts                   # Environment variable parser
├── prisma/
│   ├── schema.prisma            # Prisma schema
│   ├── migrations/              # Versioned migrations
│   └── seed.ts                  # Seed script
├── data/                        # Seed fixtures and local reference data
├── docs/                        # Architecture, API, schema, operational docs
├── tests/
│   ├── unit/                    # Pure business logic tests
│   ├── integration/             # DB and API integration tests
│   └── e2e/                     # Browser and checkout flows
├── scripts/                     # DevOps and maintenance automation
├── public/                      # Static assets
├── Dockerfile                   # Container build definition
├── docker-compose.yml           # Local dependencies for dev/test
├── package.json                 # Node package manifest
└── README.md                    # Setup and onboarding
```

## Notes
- `app/` should stay thin: route composition and request orchestration only.
- `modules/` should own business rules and domain contracts.
- `lib/` should hold infrastructure code, not core domain behavior.
- `docs/` should be treated as part of the deliverable, not an afterthought.
