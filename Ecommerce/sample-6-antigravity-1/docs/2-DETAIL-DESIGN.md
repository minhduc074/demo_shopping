# Futurelink Ecommerce — Very Detail Design

> **Level 2 of 3** · Implementation-ready specification for developers
> **Project**: `sample-6-antigravity` · **Stack**: Next.js 14 · TypeScript · Prisma · PostgreSQL · Stripe
> **Last Updated**: 2026-04-08

---

## Table of Contents

1. [Folder / File Structure](#1-folder--file-structure)
2. [Database Schema](#2-database-schema)
3. [API Endpoints](#3-api-endpoints)
4. [Component Breakdown](#4-component-breakdown)
5. [State Management](#5-state-management)
6. [Auth Flow](#6-auth-flow)
7. [Error Handling Strategy](#7-error-handling-strategy)
8. [Environment Variables](#8-environment-variables)

---

## 1. Folder / File Structure

```
sample-6-antigravity/
├── app/                              # Next.js App Router root
│   ├── layout.tsx                    # Root HTML shell, imports globals.css
│   ├── globals.css                   # Design tokens (CSS vars), Tailwind base, utility classes
│   ├── page.tsx                      # Public homepage (SSR: hero + featured products)
│   │
│   ├── login/
│   │   └── page.tsx                  # Login form page (Server Component + client form)
│   ├── register/
│   │   └── page.tsx                  # Registration form page
│   ├── cart/
│   │   └── page.tsx                  # Cart page (auth-gated)
│   ├── checkout/
│   │   └── session/
│   │       └── page.tsx              # Post-Stripe redirect handler; finalizes order
│   ├── orders/
│   │   └── page.tsx                  # Order history list (auth-gated)
│   ├── products/
│   │   └── [slug]/
│   │       └── page.tsx              # Dynamic product detail page
│   ├── search/
│   │   └── page.tsx                  # Search + filter results page
│   │
│   ├── admin/
│   │   ├── page.tsx                  # Admin dashboard: revenue / KPIs / recent orders
│   │   └── products/
│   │       └── page.tsx              # Admin product list + inline edit form
│   │
│   └── api/                          # Route Handlers (JSON API)
│       ├── auth/
│       │   ├── login/route.ts        # POST /api/auth/login
│       │   ├── logout/route.ts       # POST /api/auth/logout
│       │   └── register/route.ts     # POST /api/auth/register
│       ├── cart/
│       │   └── route.ts              # GET / POST / PATCH /api/cart
│       ├── checkout/
│       │   └── session/route.ts      # POST /api/checkout/session
│       └── stripe/
│           └── webhook/route.ts      # POST /api/stripe/webhook
│
├── components/
│   ├── store/                        # Customer-facing UI components
│   │   ├── site-header.tsx           # Global nav bar with cart badge + auth links
│   │   ├── product-card.tsx          # Product tile (image, name, price, inventory)
│   │   ├── cart-panel.tsx            # Slide-over cart drawer with item list + totals
│   │   ├── add-to-cart-button.tsx    # Client button: POST /api/cart on click
│   │   └── checkout-button.tsx       # Client button: POST /api/checkout/session → redirect
│   ├── admin/                        # Admin-only UI components
│   ├── auth/                         # Auth form components (login, register)
│   └── ui/                           # Shared primitive components (buttons, inputs, etc.)
│
├── lib/
│   ├── auth.ts                       # Business logic: register, login, logout, session guards
│   ├── contracts.ts                  # Zod schemas + TypeScript DTO types for all API shapes
│   ├── data.ts                       # All Prisma query functions (the data access layer)
│   ├── env.ts                        # Typed env var accessors — throws on missing value
│   ├── password.ts                   # PBKDF2 password hashing + verification
│   ├── prisma.ts                     # Singleton Prisma client (dev hot-reload safe)
│   ├── session.ts                    # HMAC-SHA256 signed cookie session: encode/decode
│   ├── stripe.ts                     # Stripe SDK singleton
│   ├── api-client.ts                 # Browser-side fetch helpers for API routes
│   └── utils.ts                      # createOrderNumber(), formatCurrency(), etc.
│
├── prisma/
│   ├── schema.prisma                 # Canonical DB schema (source of truth)
│   └── seed.ts                       # Dev seed: categories, products, admin user
│
├── scripts/
│   └── download-stitch.ts            # Asset extraction script (pulls from Stitch project)
│
├── public/                           # Static assets served at root
├── .env                              # Local environment variables (gitignored)
├── next.config.mjs                   # Next.js config (image domains, etc.)
├── tailwind.config.ts                # TailwindCSS config (content paths, theme extension)
└── tsconfig.json                     # TypeScript strict mode + path aliases (@/*)
```

---

## 2. Database Schema

### 2.1 Enums

| Enum | Values |
|---|---|
| `UserRole` | `CUSTOMER`, `ADMIN` |
| `ProductStatus` | `ACTIVE`, `DRAFT`, `ARCHIVED` |
| `InventoryStatus` | `IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK` |
| `OrderStatus` | `PENDING`, `PAID`, `FULFILLED`, `CANCELED` |
| `PaymentStatus` | `PENDING`, `SUCCEEDED`, `FAILED`, `CANCELED`, `REFUNDED` |

---

### 2.2 Table: `UserProfile`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `String` | PK, `cuid()` | Primary key |
| `email` | `String` | `UNIQUE`, NOT NULL | Lowercased before storage |
| `fullName` | `String?` | nullable | Optional display name |
| `passwordHash` | `String` | NOT NULL | PBKDF2-SHA256 hash |
| `passwordSalt` | `String` | NOT NULL | 16-byte random salt (hex) |
| `role` | `UserRole` | default `CUSTOMER` | Guards admin routes |
| `createdAt` | `DateTime` | default `now()` | |
| `updatedAt` | `DateTime` | auto-update | |

**Relations**: has one `Cart`, has many `Order`

---

### 2.3 Table: `Category`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `String` | PK, `cuid()` | |
| `name` | `String` | NOT NULL | Display name |
| `slug` | `String` | `UNIQUE`, NOT NULL | URL path segment |
| `description` | `String?` | nullable | |
| `icon` | `String?` | nullable | Emoji or icon code |
| `createdAt` | `DateTime` | default `now()` | |
| `updatedAt` | `DateTime` | auto-update | |

**Relations**: has many `Product`

---

### 2.4 Table: `Product`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `String` | PK, `cuid()` | |
| `categoryId` | `String` | FK → `Category.id` CASCADE | |
| `name` | `String` | NOT NULL | |
| `slug` | `String` | `UNIQUE`, NOT NULL | URL path segment |
| `sku` | `String` | `UNIQUE`, NOT NULL | Stock-keeping unit |
| `shortDescription` | `String` | NOT NULL | Card subtitle (1–2 lines) |
| `description` | `String` | NOT NULL | Full markdown body |
| `price` | `Decimal(10,2)` | NOT NULL | Current selling price |
| `compareAtPrice` | `Decimal(10,2)?` | nullable | MSRP for strike-through display |
| `inventoryCount` | `Int` | default `0` | Units currently in stock |
| `inventoryStatus` | `InventoryStatus` | default `IN_STOCK` | Label override |
| `status` | `ProductStatus` | default `ACTIVE` | Controls storefront visibility |
| `featured` | `Boolean` | default `false` | Shown in homepage featured grid |
| `createdAt` | `DateTime` | default `now()` | |
| `updatedAt` | `DateTime` | auto-update | |

**Relations**: belongs to `Category`; has many `ProductImage`, `CartItem`, `OrderItem`

---

### 2.5 Table: `ProductImage`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `String` | PK, `cuid()` | |
| `productId` | `String` | FK → `Product.id` CASCADE | |
| `url` | `String` | NOT NULL | Absolute image URL |
| `alt` | `String` | NOT NULL | Accessibility alt text |
| `sortOrder` | `Int` | default `0` | Lower value = primary image |
| `createdAt` | `DateTime` | default `now()` | |

---

### 2.6 Table: `Cart`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `String` | PK, `cuid()` | |
| `userId` | `String` | `UNIQUE`, FK → `UserProfile.id` CASCADE | One cart per user (upsert pattern) |
| `createdAt` | `DateTime` | default `now()` | |
| `updatedAt` | `DateTime` | auto-update | |

**Relations**: belongs to `UserProfile`; has many `CartItem`

---

### 2.7 Table: `CartItem`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `String` | PK, `cuid()` | |
| `cartId` | `String` | FK → `Cart.id` CASCADE | |
| `productId` | `String` | FK → `Product.id` CASCADE | |
| `quantity` | `Int` | default `1` | |
| `createdAt` | `DateTime` | default `now()` | |
| `updatedAt` | `DateTime` | auto-update | |

**Indexes**: `@@unique([cartId, productId])` — prevents duplicate rows; enables upsert pattern

---

### 2.8 Table: `Order`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `String` | PK, `cuid()` | |
| `userId` | `String` | FK → `UserProfile.id` CASCADE | |
| `orderNumber` | `String` | `UNIQUE` | Human-readable e.g. `ORD-20260408-ABCD` |
| `status` | `OrderStatus` | default `PENDING` | Lifecycle state machine |
| `subtotal` | `Decimal(10,2)` | NOT NULL | Pre-tax total |
| `taxAmount` | `Decimal(10,2)` | NOT NULL | 8% of subtotal |
| `totalAmount` | `Decimal(10,2)` | NOT NULL | `subtotal + taxAmount` |
| `stripeCheckoutSessionId` | `String?` | `UNIQUE`, nullable | Links order to Stripe session |
| `createdAt` | `DateTime` | default `now()` | |
| `updatedAt` | `DateTime` | auto-update | |

**Relations**: belongs to `UserProfile`; has many `OrderItem`; has one `Payment`

---

### 2.9 Table: `OrderItem`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `String` | PK, `cuid()` | |
| `orderId` | `String` | FK → `Order.id` CASCADE | |
| `productId` | `String` | FK → `Product.id` RESTRICT | Prevents product deletion if ordered |
| `productName` | `String` | NOT NULL | Snapshot of name at purchase time |
| `productSlug` | `String` | NOT NULL | Snapshot of slug for deep linking |
| `quantity` | `Int` | NOT NULL | |
| `unitPrice` | `Decimal(10,2)` | NOT NULL | Price locked at time of purchase |
| `totalPrice` | `Decimal(10,2)` | NOT NULL | `unitPrice × quantity` |

---

### 2.10 Table: `Payment`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `String` | PK, `cuid()` | |
| `orderId` | `String` | `UNIQUE`, FK → `Order.id` CASCADE | One payment per order |
| `provider` | `String` | default `"stripe"` | Extensible for future gateways |
| `status` | `PaymentStatus` | default `PENDING` | |
| `amount` | `Decimal(10,2)` | NOT NULL | Mirrors order `totalAmount` |
| `stripeCheckoutSessionId` | `String?` | `UNIQUE`, nullable | |
| `stripePaymentIntentId` | `String?` | `UNIQUE`, nullable | Set on webhook confirmation |
| `createdAt` | `DateTime` | default `now()` | |
| `updatedAt` | `DateTime` | auto-update | |

---

## 3. API Endpoints

### 3.1 Authentication

| Method | Path | Auth | Request Body | Response | Status Codes |
|---|---|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | `{ email, password, fullName? }` | `{ id, email, fullName, role }` | 200, 400, 500 |
| `POST` | `/api/auth/login` | ❌ | `{ email, password }` | `{ id, email, fullName, role }` | 200, 401, 500 |
| `POST` | `/api/auth/logout` | ✅ | _(none)_ | `{ ok: true }` | 200 |

> All auth routes set or clear the `futurelink_session` HttpOnly cookie on success.

---

### 3.2 Cart

| Method | Path | Auth | Request Body | Response |
|---|---|---|---|---|
| `GET` | `/api/cart` | ✅ | _(none)_ | `CartDto` |
| `POST` | `/api/cart` | ✅ | `{ productId: string, quantity?: number }` | `CartDto` (updated) |
| `PATCH` | `/api/cart` | ✅ | `{ itemId: string, quantity: number }` | `CartDto` (updated); `quantity=0` removes the item |

**`CartDto` shape:**

```ts
{
  id: string
  itemCount: number
  subtotal: number
  taxAmount: number       // subtotal × 0.08
  totalAmount: number
  items: Array<{
    id: string
    productId: string
    productSlug: string
    productName: string
    imageUrl: string
    quantity: number
    unitPrice: number
    lineTotal: number
    inventoryLabel: string  // "In stock" | "3 left" | "Out of stock"
  }>
}
```

---

### 3.3 Checkout

| Method | Path | Auth | Request Body | Response |
|---|---|---|---|---|
| `POST` | `/api/checkout/session` | ✅ | _(none)_ | `{ sessionId: string, url: string }` |

**Flow:**
1. Server reads user's cart from DB
2. Creates a Stripe Checkout Session with line items
3. Creates a `PENDING` Order + `PENDING` Payment record in the DB (linked via `stripeCheckoutSessionId`)
4. Returns the Stripe-hosted checkout URL for client redirect

---

### 3.4 Stripe Webhook

| Method | Path | Auth | Request Body | Response |
|---|---|---|---|---|
| `POST` | `/api/stripe/webhook` | Stripe HMAC signature | Raw Stripe event body | `{ received: true }` or `{ error }` |

**Handled events:**

| Event | Action |
|---|---|
| `checkout.session.completed` | Calls `finalizeOrderPaymentByCheckoutSessionId()` inside a Prisma `$transaction`: marks Payment→`SUCCEEDED`, Order→`PAID`, decrements `inventoryCount` per item, deletes all `CartItems` |

---

## 4. Component Breakdown

### 4.1 `SiteHeader` — `components/store/site-header.tsx`

| Property | Detail |
|---|---|
| **Type** | Async Server Component |
| **Props** | none |
| **Server reads** | `getCurrentUserProfile()` (session cookie) + `getCartForUser()` (item count) |
| **Renders** | Logo, nav links, cart icon with item count badge, login / logout / admin links |
| **Note** | Admin link rendered only when `profile.role === ADMIN` |

---

### 4.2 `ProductCard` — `components/store/product-card.tsx`

| Property | Detail |
|---|---|
| **Type** | Server Component |
| **Props** | `product: ProductCard` |
| **Renders** | Product image, name, category badge, short description, price, compare-at strike-through, inventory label, link to `/products/[slug]` |

---

### 4.3 `CartPanel` — `components/store/cart-panel.tsx`

| Property | Detail |
|---|---|
| **Type** | Client Component (`"use client"`) |
| **Props** | `initialCart: CartDto` |
| **State** | `cart: CartDto` — re-set after each successful mutation |
| **Actions** | `PATCH /api/cart` on quantity change; `quantity=0` triggers item removal |
| **Renders** | Slide-over drawer, scrollable item list, per-item quantity stepper, subtotal / tax / total summary, Checkout button |

---

### 4.4 `AddToCartButton` — `components/store/add-to-cart-button.tsx`

| Property | Detail |
|---|---|
| **Type** | Client Component |
| **Props** | `productId: string` |
| **State** | `loading: boolean` — set `true` on click, reset on response |
| **Action** | `POST /api/cart` with `{ productId, quantity: 1 }` — prevents double-submit while loading |

---

### 4.5 `CheckoutButton` — `components/store/checkout-button.tsx`

| Property | Detail |
|---|---|
| **Type** | Client Component |
| **Props** | none |
| **State** | `loading: boolean` |
| **Action** | `POST /api/checkout/session` → on success: `window.location.href = url` (Stripe redirect) |

---

## 5. State Management

| State | Location | Mechanism | Notes |
|---|---|---|---|
| User session / identity | Server (HttpOnly cookie) | HMAC-signed cookie parsed via `getSession()` | Stateless — no server store needed |
| Product catalog | Server (PostgreSQL) | Direct Prisma queries inside Server Components | No client cache |
| Cart data | Server (PostgreSQL) via REST API | Fetched fresh on every SSR render; mutated via `POST/PATCH /api/cart` | |
| Cart UI (local mirror) | Client (`useState`) | `CartPanel` holds `CartDto` and re-renders after each mutation | Optimistic-like update |
| Button loading flags | Client (`useState`) | Per-button `loading: boolean` | Prevents double-submit |
| Search / filter params | URL query string | `?q=keyword&category=slug` — read from `searchParams` in Server Component | Shareable URLs |
| **No global client store** | — | No Redux / Zustand / Context used | Server is the single source of truth |

---

## 6. Auth Flow

```
Step 1 — Form submit
  User fills /login or /register form
  Client-side fetch: POST /api/auth/login (or /register)

Step 2 — Route handler receives request
  Reads JSON body: { email, password [, fullName] }

Step 3 — DB lookup
  prisma.userProfile.findUnique({ where: { email: email.toLowerCase() } })

Step 4a — [Register path]
  If profile exists → throw "Email is already registered"
  createSalt() → 16-byte random hex string
  hashPassword(password, salt) → PBKDF2-SHA256, 100k iterations, 64-byte key
  prisma.userProfile.create({ email, fullName, passwordHash, passwordSalt })

Step 4b — [Login path]
  If profile not found → throw "Invalid email or password"
  verifyPassword(input, salt, hash) → re-hash and timingSafeEqual compare
  If mismatch → throw "Invalid email or password"

Step 5 — createSession(userId)
  Build payload: { userId, expiresAt: Date.now() + 7 days }
  Encode:   base64url(JSON.stringify(payload))         → body
  Sign:     HMAC-SHA256(body, AUTH_SECRET) → base64url → signature
  Cookie:   `${body}.${signature}`
  Flags:    HttpOnly=true, SameSite=Lax, Secure=true(prod), Path=/, Expires=7d

Step 6 — Subsequent requests: getSession()
  Read cookie `futurelink_session`
  Split on "." → [body, signature]
  Re-compute expectedSig = HMAC-SHA256(body, AUTH_SECRET)
  timingSafeEqual(sig, expectedSig) → null if mismatch (timing-safe)
  JSON.parse(base64url.decode(body)) → check expiresAt > Date.now()
  Return { userId } or null

Step 7 — Route guards
  requireSignedInProfile() → getSession() returns null → redirect("/login")
  requireAdminProfile()    → profile.role !== ADMIN  → redirect("/")

Step 8 — Logout
  POST /api/auth/logout
  destroySession() → cookies().delete("futurelink_session")
  Client redirects to /
```

---

## 7. Error Handling Strategy

### Per-layer strategy

| Layer | Approach |
|---|---|
| **API Routes** | `try/catch` around every async operation; return `{ error: message }` with appropriate HTTP status |
| **Client Components** | `loading` state blocks double-submit; display inline error text on catch |
| **Server Components** | Unhandled errors bubble to Next.js error boundary (`error.tsx`) |
| **Missing env vars** | `lib/env.ts` `required()` throws at process startup naming the missing variable |
| **Webhook** | Raw body + Stripe signature verified before any DB operation; invalid signature returns 400 immediately |

### Error code reference

| Error Message | Trigger | HTTP Status |
|---|---|---|
| `"Email is already registered"` | Register with duplicate email | 400 |
| `"Invalid email or password"` | Login with wrong email or password (generic — prevents enumeration) | 401 |
| `"Cart item not found"` | PATCH with an `itemId` not owned by the current user's cart | 404-equivalent (500) |
| `"Cart is empty"` | Checkout attempted with no items in cart | 400 |
| `"Unauthorized"` | API route called without a valid session cookie | 401 |
| `"Invalid webhook signature"` | Stripe webhook body or signature tampered | 400 |
| `e.message` (Prisma / unexpected) | Any unhandled server error | 500 |

### Idempotency guards (webhook)

| Reason Returned | Meaning |
|---|---|
| `ORDER_NOT_FOUND` | No order linked to this Stripe session ID — log and ignore |
| `ALREADY_FINALIZED` | Order is already `PAID` — safe no-op; Stripe can retry freely |

---

## 8. Environment Variables

| Variable | Required | Purpose | Example Value |
|---|---|---|---|
| `DATABASE_URL` | ✅ | Prisma PostgreSQL connection string | `postgresql://user@localhost:5432/futurelink?schema=public` |
| `AUTH_SECRET` | ✅ | HMAC-SHA256 signing key for session cookies | `3373551fb2c7dd6b964df655ad8c978...` (64-char hex) |
| `STRIPE_SECRET_KEY` | ✅ | Stripe server-side API key | `sk_test_51TEM8r...` |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe webhook signature verification secret | `whsec_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | Stripe client-side key (safe to expose) | `pk_test_51TEM8r...` |
| `NEXT_PUBLIC_APP_URL` | ⬜ | Base URL for Stripe success/cancel redirect URLs | `https://futurelink.example.com` |

> [!CAUTION]
> `AUTH_SECRET` must be at least 32 bytes of cryptographically random data. Never share between environments. Rotating this key immediately invalidates all active user sessions.

> [!NOTE]
> Variables prefixed `NEXT_PUBLIC_` are bundled into the client-side JavaScript. Never prefix server secrets with `NEXT_PUBLIC_`.

---

## Related Documents

| Document | Path |
|---|---|
| Basic Design (Level 1) | [`1-BASIC-DESIGN.md`](./1-BASIC-DESIGN.md) |
| Architecture Design (Level 3) | [`3-ARCHITECTURE-DESIGN.md`](./3-ARCHITECTURE-DESIGN.md) |
