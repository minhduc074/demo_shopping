# Demo Shopping — Technical & Architecture Design

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Technology Stack](#3-technology-stack)
4. [System Components](#4-system-components)
5. [Data Architecture](#5-data-architecture)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [API Design](#7-api-design)
8. [Frontend Architecture](#8-frontend-architecture)
9. [State Management](#9-state-management)
10. [Payment Flow](#10-payment-flow)
11. [Rendering Strategy](#11-rendering-strategy)
12. [File & Directory Structure](#12-file--directory-structure)
13. [Environment Configuration](#13-environment-configuration)
14. [Testing Architecture](#14-testing-architecture)
15. [Data Flow Diagrams](#15-data-flow-diagrams)
16. [Security Design](#16-security-design)
17. [Performance Design](#17-performance-design)
18. [Known Limitations & Future Work](#18-known-limitations--future-work)

---

## 1. Project Overview

**Demo Shopping** is a full-stack e-commerce web application modelled after Shopee's UI and UX patterns. It supports product browsing, a client-side shopping cart, user authentication (email/password + OAuth), and a Stripe-powered checkout flow.

### Core User Journeys

| Journey | Entry Point | Exit Point |
|---|---|---|
| Browse products | `/` homepage | Product card hover → add to cart |
| Sign in / Sign up | `/login` | Redirected after OAuth callback |
| Checkout | Cart Drawer → Checkout | `/checkout/success` |
| Infinite scroll discovery | `DailyDiscover` grid | Paginated API |

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Browser (Client)                        │
│                                                                  │
│  React Client Components  ←→  React Server Components           │
│  Cart Context (localStorage)   AuthActions (Supabase JS SDK)    │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTP / RSC payload
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js 15 Edge Runtime                      │
│                                                                  │
│  Middleware (Supabase session refresh on every request)          │
│  App Router  →  RSC pages  →  API Route Handlers                │
└──────┬──────────────────┬────────────────┬───────────────────────┘
       │                  │                │
       ▼                  ▼                ▼
┌──────────┐    ┌─────────────────┐   ┌───────────────────┐
│ Supabase │    │  Supabase Auth  │   │  Stripe API       │
│ Postgres │    │  (OAuth + JWT)  │   │  (Checkout)       │
│  (pg)    │    └─────────────────┘   └───────────────────┘
└──────────┘
```

### Tier Breakdown

| Tier | Technology | Responsibility |
|---|---|---|
| Presentation | Next.js RSC + React CC | Rendering, routing, UI |
| State | React `useReducer` + localStorage | Cart state, auth state |
| API | Next.js Route Handlers | Products pagination, Stripe session creation |
| Auth | Supabase Auth + SSR middleware | Session management, OAuth |
| Data | PostgreSQL via `pg` Pool | Product persistence |
| Payments | Stripe Checkout | Payment processing |

---

## 3. Technology Stack

### Runtime & Framework

| Package | Version | Role |
|---|---|---|
| `next` | ^15.3.1 | Full-stack framework (App Router) |
| `react` / `react-dom` | ^19.1.0 | UI library |
| `typescript` | ^5.8.3 | Static typing |

### Backend Services

| Package | Version | Role |
|---|---|---|
| `@supabase/supabase-js` | ^2.49.4 | Auth client SDK |
| `@supabase/ssr` | ^0.6.1 | Cookie-based SSR auth adapter |
| `pg` | ^8.20.0 | Direct PostgreSQL connection pool |
| `stripe` | ^17.7.0 | Server-side Stripe SDK |
| `@stripe/stripe-js` | ^5.6.0 | Client-side Stripe.js |

### Styling

| Package | Version | Role |
|---|---|---|
| `tailwindcss` | ^4.1.3 | Utility-first CSS framework |
| `@tailwindcss/postcss` | ^4.1.3 | PostCSS integration |
| `postcss` | ^8.5.3 | CSS transform pipeline |

### Testing

| Package | Version | Role |
|---|---|---|
| `jest` | ^29.7.0 | Test runner |
| `ts-jest` | ^29.4.6 | TypeScript transformer for Jest |
| `jest-environment-jsdom` | ^29.7.0 | Browser-like DOM environment |
| `@testing-library/react` | ^16.3.2 | Component rendering utilities |
| `@testing-library/jest-dom` | ^6.9.1 | Custom DOM matchers |
| `@testing-library/user-event` | ^14.6.1 | User interaction simulation |

---

## 4. System Components

### 4.1 Next.js Middleware

**File:** `src/middleware.ts`

Runs on every request except static assets and images. Delegates to Supabase's `updateSession` which:
1. Reads the Supabase access/refresh token cookies
2. Calls `supabase.auth.getUser()` to validate the JWT
3. Writes updated tokens back to the response cookies via `Set-Cookie`

**Matcher pattern:**
```
/((?!_next/static|_next/image|favicon.ico|.*\.(svg|png|jpg|jpeg|gif|webp)$).*)
```

This ensures auth sessions are continuously refreshed without impacting static file performance.

---

### 4.2 Supabase Clients (Three Variants)

The project uses the **three-client pattern** required by `@supabase/ssr`:

| Client | File | Context | Cookie strategy |
|---|---|---|---|
| **Browser** | `src/lib/supabase/client.ts` | Client Components | Reads/writes browser cookies directly |
| **Server** | `src/lib/supabase/server.ts` | Server Components, Route Handlers | Uses Next.js `cookies()` adapter (read-only) |
| **Middleware** | `src/lib/supabase/middleware.ts` | Edge Middleware | Reads request cookies, writes response cookies |

```
Client Component  →  createBrowserClient()  →  Supabase Auth
Server Component  →  createServerClient()   →  Supabase Auth (read-only cookies)
Middleware        →  updateSession()         →  Supabase Auth (mutate cookies)
```

---

### 4.3 Database Layer

**File:** `src/lib/db/products.ts`

Uses a **singleton `pg.Pool`** pattern via `globalThis` to survive hot-reload in development:

```typescript
const globalForPool = globalThis as typeof globalThis & { pgPool?: Pool };
if (!globalForPool.pgPool) {
  globalForPool.pgPool = new Pool({ connectionString: process.env.POSTGRES_URL_NON_POOLING });
}
export const pool = globalForPool.pgPool;
```

#### Product Interface

```typescript
interface Product {
  id: string;           // UUID
  name: string;
  price: number;        // in VND
  original_price: number;
  discount: number;     // percentage
  image: string;        // URL
  sold_count: number;
  rating: number;       // 1–5
  category: string;
  is_flash_sale: boolean;
  is_mall: boolean;
  is_new: boolean;
}
```

#### Query Functions

| Function | SQL Pattern | Used By |
|---|---|---|
| `getFlashSaleProducts(limit)` | `WHERE is_flash_sale = true ORDER BY sold_count DESC LIMIT $1` | Homepage RSC |
| `getDailyProducts(limit, page)` | `WHERE is_flash_sale = false ORDER BY sold_count DESC LIMIT $1 OFFSET $2` | Homepage RSC + `/api/products` |
| `getProductsByCategory(category, limit, page)` | `WHERE category = $1 ... LIMIT/OFFSET` | (Available, not yet wired to UI) |
| `searchProducts(query, limit)` | `WHERE name ILIKE $1 OR category ILIKE $1` | (Available, not yet wired to UI) |

---

### 4.4 Stripe Integration

**Server:** `src/lib/stripe.ts` — Stripe SDK initialized once with `apiVersion: "2025-02-24.acacia"`.

**Checkout Route:** `src/app/api/checkout/route.ts`
- Receives `{ items: CartItem[] }` from client
- Maps items to `line_items` with unit amounts in cents
- Creates a `checkout.session` with:
  - `payment_method_types: ["card"]`
  - `success_url`: `${BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
  - `cancel_url`: `${BASE_URL}/checkout`
- Returns `{ url }` — client redirects `window.location.href`

---

## 5. Data Architecture

### 5.1 Database Schema

**Table:** `public.products`

```sql
CREATE TABLE public.products (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  price          INTEGER NOT NULL,          -- VND (whole numbers)
  original_price INTEGER NOT NULL,
  discount       INTEGER NOT NULL DEFAULT 0, -- percentage 0-100
  image          TEXT NOT NULL,             -- external image URL
  sold_count     INTEGER NOT NULL DEFAULT 0,
  rating         NUMERIC(3,1) DEFAULT 4.5,  -- 1.0 – 5.0
  category       TEXT NOT NULL,
  is_flash_sale  BOOLEAN NOT NULL DEFAULT false,
  is_mall        BOOLEAN NOT NULL DEFAULT false,
  is_new         BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE INDEX idx_products_category     ON public.products(category);
CREATE INDEX idx_products_flash_sale   ON public.products(is_flash_sale);
CREATE INDEX idx_products_price        ON public.products(price);
CREATE INDEX idx_products_sold_count   ON public.products(sold_count DESC);
CREATE INDEX idx_products_created_at   ON public.products(created_at DESC);
```

**Row Level Security:**
```sql
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access"
  ON public.products FOR SELECT USING (true);
```

### 5.2 Seed Data

**Script:** `scripts/seed.mjs`

- Drops + recreates the products table
- Generates **10,000 synthetic products** from:
  - 12 categories (Electronics, Fashion, Home & Living, Beauty, Sports, Books, Toys, Food, Automotive, Health, Garden, Pet)
  - 15 name templates per category
  - 5 random adjectives (Premium, Ultra, Pro, Smart, Eco)
  - Random prices, discounts (10–70%), sold counts (100–50,000)
  - ~10% flash sale, ~20% mall certified, ~15% new arrivals
- Inserts in batches of 500 rows

### 5.3 Cart State (Client-Side Only)

Cart data is **never persisted server-side**. It lives in:
1. **React state** (in-memory, `useReducer`)
2. **`localStorage`** (key: `"cart"`, JSON serialized)

No cart table in database. Cart items are hydrated from localStorage on first render.

---

## 6. Authentication & Authorization

### 6.1 Auth Providers

| Provider | Method | Config |
|---|---|---|
| Email/Password | Supabase built-in | Sign-in + sign-up toggle in `LoginForm` |
| Google | OAuth 2.0 | `signInWithOAuth({ provider: "google" })` |
| Facebook | OAuth 2.0 | `signInWithOAuth({ provider: "facebook" })` |
| Apple | OAuth 2.0 | `signInWithOAuth({ provider: "apple" })` |

### 6.2 OAuth Flow

```
User clicks "Login with Google"
        │
        ▼
LoginForm → supabase.auth.signInWithOAuth()
        │
        ▼ redirect
Google OAuth Consent Screen
        │
        ▼ callback with ?code=
/auth/callback/route.ts
        │
supabase.auth.exchangeCodeForSession(code)
        │
        ▼ redirect
/ (homepage) or ?next= target
```

### 6.3 Session Lifecycle

```
Every HTTP Request
        │
        ▼
Middleware (src/middleware.ts)
        │
updateSession() — reads JWT from cookie
        │
        ├─ Valid JWT  → refresh if near expiry → write updated cookie
        └─ Expired    → attempt refresh via Supabase → or clear session
```

### 6.4 Protected Routes

Currently **no route is explicitly protected** by the middleware. Auth is used for:
- Displaying username / logout button in Header (via `AuthActions`)
- OAuth sign-in flow

Checkout does **not** require authentication — guest checkout is supported via Stripe.

---

## 7. API Design

### 7.1 `GET /api/products`

**Purpose:** Infinite scroll pagination for Daily Discover grid.

**Query Parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | `1` | Page number (1-indexed) |
| `limit` | number | `12` | Items per page |

**Response:**
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "string",
      "price": 150000,
      "original_price": 200000,
      "discount": 25,
      "image": "https://...",
      "sold_count": 1234,
      "rating": 4.5,
      "category": "Electronics",
      "is_flash_sale": false,
      "is_mall": true,
      "is_new": false
    }
  ]
}
```

**Error Response:** `{ "error": "message" }` with HTTP 500.

---

### 7.2 `POST /api/checkout`

**Purpose:** Create a Stripe Checkout Session.

**Request Body:**
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Product Name",
      "price": 150000,
      "quantity": 2,
      "image": "https://..."
    }
  ]
}
```

**Response:**
```json
{ "url": "https://checkout.stripe.com/pay/cs_test_..." }
```

**Price mapping:** `unit_amount = Math.round(price * 100)` — assumes prices are in VND formatted as decimals. (Note: actual prices in DB are integers in VND, so this multiplies by 100 — a known issue for VND which has no sub-units.)

**Error Response:** `{ "error": "message" }` with HTTP 500.

---

### 7.3 `GET /auth/callback`

**Purpose:** Handle Supabase OAuth redirect.

**Query Parameters:** `code` (OAuth auth code), `next` (optional redirect path).

**Behavior:**
- Success: `exchangeCodeForSession(code)` → redirect to `next` param or `/`
- Failure: redirect to `/login?error=...`

---

## 8. Frontend Architecture

### 8.1 Page Hierarchy

```
RootLayout (CartProvider, CartDrawer)
├── / (Homepage)
│   ├── Header (full variant)
│   ├── Hero Banner (RSC)
│   ├── Category Navigation (RSC)
│   ├── Flash Sale Section (RSC)
│   ├── DailyDiscover (Client Component, infinite scroll)
│   └── Footer
│
├── /login
│   ├── Header (login variant)
│   └── LoginForm (Client Component)
│
├── /checkout
│   ├── Header (checkout variant)
│   └── CheckoutContent (Client Component)
│
└── /checkout/success
    ├── Header (checkout variant)
    └── ClearCartOnSuccess (Client Component, in Suspense)
```

### 8.2 Component Classification

#### Server Components (RSC)
Components that run only on the server, have no interactivity:

| Component | Data Source | Notes |
|---|---|---|
| `app/page.tsx` | `getFlashSaleProducts`, `getDailyProducts` | `revalidate = 60` (ISR) |
| `app/checkout/page.tsx` | Static | Progress step bar |
| `app/checkout/success/page.tsx` | Static | Wraps Suspense |
| `app/login/page.tsx` | Static | Background image |
| `app/layout.tsx` | Static | Root layout |

#### Client Components (`"use client"`)
Components that require browser APIs, event handlers, or React hooks:

| Component | Key State / Hooks |
|---|---|
| `AuthActions` | `useEffect`, Supabase `onAuthStateChange` |
| `CartIcon` | `useCart()` → count badge |
| `CartDrawer` | `useCart()` → item list, open/close |
| `ProductCard` | `useCart()` → `addToCart` on hover |
| `DailyDiscover` | `useState` (products, page, hasMore), fetch pagination |
| `CheckoutContent` | `useCart()`, `useState` (payment method, form) |
| `ClearCartOnSuccess` | `useSearchParams()`, `useCart()` → `clearCart()` |
| `LoginForm` | `useState` (email, password, mode), Supabase auth calls |
| `Header` | Renders `AuthActions` + `CartIcon` (both CC) |

### 8.3 Header Variants

The `Header` component accepts a `variant` prop:

```typescript
type HeaderVariant = "full" | "login" | "checkout";
```

| Variant | Elements |
|---|---|
| `full` | Logo, Search bar, Region selector, Auth actions, Cart icon, Navigation links |
| `login` | Logo (centered), "Need help?" link |
| `checkout` | Logo, CartIcon |

---

## 9. State Management

### 9.1 Cart Context

**File:** `src/lib/cart/context.tsx`

Uses `useReducer` with the following shape:

```typescript
interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}
```

#### Actions

| Action Type | Payload | Effect |
|---|---|---|
| `ADD` | `CartItem` | Upsert item (increment qty if exists) |
| `REMOVE` | `{ id: string }` | Remove item by id |
| `UPDATE_QTY` | `{ id: string, quantity: number }` | Set quantity (removes if 0) |
| `CLEAR` | — | Empty the cart array |
| `OPEN` | — | Set `isOpen = true` |
| `CLOSE` | — | Set `isOpen = false` |
| `HYDRATE` | `CartItem[]` | Restore from localStorage |

#### Persistence Strategy

```
Mount
  → Read localStorage["cart"]
  → Dispatch HYDRATE with parsed items

Every state change
  → useEffect watches state.items
  → localStorage.setItem("cart", JSON.stringify(state.items))

Checkout success
  → ClearCartOnSuccess dispatches CLEAR
  → localStorage["cart"] = "[]"
```

#### Exposed API via `useCart()`

```typescript
{
  items: CartItem[];
  isOpen: boolean;
  count: number;              // total quantity across all items
  total: number;              // sum of price × quantity
  addToCart: (product) => void;
  removeFromCart: (id) => void;
  updateQuantity: (id, qty) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}
```

### 9.2 Auth State

Auth state is **not stored in React context**. Instead, `AuthActions` subscribes directly to Supabase's observable:

```typescript
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => setUser(session?.user ?? null)
  );
  return () => subscription.unsubscribe();
}, []);
```

This is a deliberate design choice — auth state is ephemeral UI state, not shared across the app.

---

## 10. Payment Flow

### 10.1 Full Checkout Sequence

```
User in CartDrawer
        │
        ▼ clicks "Checkout"
/checkout page loads
        │ (CheckoutContent reads useCart())
        ▼
User fills delivery address, selects payment method
        │
        ▼ clicks "Place Order" (payment_method = "card")
CheckoutContent.handlePlaceOrder()
        │
        ▼ POST /api/checkout { items: cart.items }
Next.js Route Handler
        │
        ▼ stripe.checkout.sessions.create(...)
Stripe API
        │
        ▼ returns { url: "https://checkout.stripe.com/..." }
Back to CheckoutContent
        │
        ▼ window.location.href = url
Stripe Hosted Checkout Page
        │
        ▼ user pays
Stripe redirects to /checkout/success?session_id=cs_...
        │
ClearCartOnSuccess mounts
        │
        ▼ useSearchParams() reads session_id
        ▼ clearCart() dispatched
Cart emptied, order confirmed UI shown
```

### 10.2 Payment Methods in UI

The `CheckoutContent` presents four payment options visually, but **only "Credit/Debit Card" triggers the Stripe flow**. Other options (COD, ShopeePay, Banking) are UI stubs — they display a form or message but `handlePlaceOrder` only calls Stripe regardless of selection.

---

## 11. Rendering Strategy

| Page | Strategy | Revalidation | Reason |
|---|---|---|---|
| `/` | ISR (Server) | 60 seconds | Product data changes infrequently; fast TTFB needed |
| `/login` | Static + CC shell | Never | No dynamic data above fold |
| `/checkout` | Static + CC shell | Never | Cart is client-side |
| `/checkout/success` | Static + CC (Suspense) | Never | Session ID from URL only |
| `/api/products` | Dynamic (Route Handler) | Per request | Infinite scroll requires live pagination |
| `/api/checkout` | Dynamic (Route Handler) | Per request | Must create fresh Stripe session |
| `/auth/callback` | Dynamic (Route Handler) | Per request | OAuth code exchange must be fresh |

### ISR Detail for Homepage

```typescript
// src/app/page.tsx
export const revalidate = 60; // seconds

// On first request: renders and caches full HTML
// Subsequent requests within 60s: serve cached HTML
// After 60s: serve stale, trigger background regeneration
```

---

## 12. File & Directory Structure

```
/demo_shopping
├── next.config.ts              # Image remote patterns
├── tsconfig.json               # TypeScript config (baseUrl: ".", @/* alias)
├── jest.config.ts              # Jest + ts-jest config
├── jest.setup.ts               # @testing-library/jest-dom import
├── postcss.config.mjs          # Tailwind PostCSS plugin
├── package.json
│
├── scripts/
│   └── seed.mjs                # DB seed: 10,000 products
│
├── stitch/                     # UI mockups (Stitch-generated HTML/CSS)
│   ├── orange_pulse/
│   ├── trang_ch_shopee_style/
│   ├── trang_ng_nh_p_shopee_style/
│   └── trang_thanh_to_n_shopee_style/
│
└── src/
    ├── middleware.ts            # Global: Supabase session refresh
    ├── __mocks__/
    │   └── fileMock.ts          # Static asset stub for Jest
    │
    ├── app/                     # Next.js App Router
    │   ├── globals.css          # Tailwind v4 theme + custom tokens
    │   ├── layout.tsx           # Root: CartProvider + CartDrawer
    │   ├── page.tsx             # Homepage (ISR, RSC)
    │   │
    │   ├── api/
    │   │   ├── checkout/
    │   │   │   ├── route.ts     # POST: Stripe session creation
    │   │   │   └── route.test.ts
    │   │   └── products/
    │   │       ├── route.ts     # GET: paginated products
    │   │       └── route.test.ts
    │   │
    │   ├── auth/
    │   │   └── callback/
    │   │       ├── route.ts     # GET: OAuth code exchange
    │   │       └── route.test.ts
    │   │
    │   ├── checkout/
    │   │   ├── page.tsx         # Checkout page wrapper
    │   │   ├── CheckoutContent.tsx  # Cart → Stripe flow
    │   │   ├── CheckoutContent.test.tsx
    │   │   └── success/
    │   │       ├── page.tsx     # Order confirmation
    │   │       ├── ClearCartOnSuccess.tsx
    │   │       └── ClearCartOnSuccess.test.tsx
    │   │
    │   └── login/
    │       ├── page.tsx         # Login page wrapper
    │       ├── LoginForm.tsx    # Email + OAuth login form
    │       └── LoginForm.test.tsx
    │
    ├── components/              # Shared UI components
    │   ├── Header.tsx           # Multi-variant header
    │   ├── Footer.tsx           # 5-column footer
    │   ├── AuthActions.tsx      # Login state / logout
    │   ├── AuthActions.test.tsx
    │   ├── CartIcon.tsx         # Cart badge button
    │   ├── CartIcon.test.tsx
    │   ├── CartDrawer.tsx       # Slide-in cart panel
    │   ├── CartDrawer.test.tsx
    │   ├── ProductCard.tsx      # Product tile with "Add to Cart"
    │   ├── ProductCard.test.tsx
    │   ├── DailyDiscover.tsx    # Infinite scroll grid
    │   └── DailyDiscover.test.tsx
    │
    └── lib/                     # Shared logic / adapters
        ├── products.ts          # Legacy static product data
        ├── products.test.ts
        ├── stripe.ts            # Stripe SDK singleton
        ├── cart/
        │   ├── context.tsx      # CartProvider + useCart
        │   └── context.test.tsx
        ├── db/
        │   └── products.ts      # pg Pool + query functions
        └── supabase/
            ├── client.ts        # Browser Supabase client
            ├── server.ts        # Server Supabase client
            └── middleware.ts    # updateSession for middleware
```

---

## 13. Environment Configuration

### Required Environment Variables

| Variable | Location | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` | Supabase project URL (public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` | Supabase anonymous key (public) |
| `POSTGRES_URL_NON_POOLING` | `.env.local` | Direct PostgreSQL connection string (server-only) |
| `STRIPE_SECRET_KEY` | `.env.local` | Stripe secret key (server-only, never exposed to client) |
| `NEXT_PUBLIC_BASE_URL` | `.env.local` | App base URL for Stripe redirect URLs |

### Security Notes

- `NEXT_PUBLIC_*` variables are bundled into the client JavaScript — only non-sensitive values use this prefix.
- `STRIPE_SECRET_KEY` and `POSTGRES_URL_NON_POOLING` are only accessed in server-side code (Route Handlers, RSC, middleware).
- Supabase Anon Key is public by design — Row Level Security policies on the database enforce access control.

---

## 14. Testing Architecture

### 14.1 Test Environment

- **Runner:** Jest 29 with jsdom
- **Transform:** ts-jest (TypeScript → CommonJS)
- **JSX:** `react-jsx` transform (no manual React import)
- **Aliases:** `@/*` maps to `src/*`

### 14.2 Test File Locations

Tests are co-located with their source files using the `.test.ts(x)` suffix convention.

### 14.3 Mocks & Stubs

| Target | Mock Strategy |
|---|---|
| CSS/SCSS files | `identity-obj-proxy` (returns class name strings) |
| Image/SVG imports | `src/__mocks__/fileMock.ts` (returns `"test-file-stub"`) |
| Supabase client | Inline `jest.mock()` per test file |
| `localStorage` | jsdom built-in |
| `fetch` | `jest.fn()` / `global.fetch` mock |

### 14.4 Coverage Configuration

Coverage is collected from all `src/**/*.{ts,tsx}` files, with these exclusions:

| Excluded File | Reason |
|---|---|
| `src/**/*.d.ts` | Type declarations only |
| `src/app/layout.tsx` | Root layout, not unit testable |
| `src/middleware.ts` | Edge runtime, integration test territory |
| `src/lib/stripe.ts` | SDK initialization only |
| `src/lib/supabase/**` | Adapter wrappers for external SDK |

### 14.5 Test Files per Layer

| Layer | Test Files |
|---|---|
| Cart Context | `src/lib/cart/context.test.tsx` |
| Static Products | `src/lib/products.test.ts` |
| API Routes | `src/app/api/checkout/route.test.ts`, `src/app/api/products/route.test.ts` |
| Auth Callback | `src/app/auth/callback/route.test.ts` |
| Pages/Components | `LoginForm.test.tsx`, `CheckoutContent.test.tsx`, `ClearCartOnSuccess.test.tsx`, `AuthActions.test.tsx`, `CartIcon.test.tsx`, `CartDrawer.test.tsx`, `ProductCard.test.tsx`, `DailyDiscover.test.tsx` |

---

## 15. Data Flow Diagrams

### 15.1 Homepage Load

```
Browser GET /
        │
        ▼
Next.js Middleware → Supabase updateSession() → continue
        │
        ▼
app/page.tsx (RSC, revalidate=60)
        │
        ├── getDailyProducts(12, 1)  ──┐
        │                              ├── pg Pool → Supabase Postgres
        └── getFlashSaleProducts(6) ──┘
        │
        ▼
RSC renders full HTML:
  Hero Banner
  Category Navigation (static)
  Flash Sale Section (6 products from DB)
  <DailyDiscover initialProducts={[...12 items]} /> (hydrated CC)
        │
        ▼
Browser receives HTML + RSC payload
DailyDiscover hydrates with initial 12 products
```

### 15.2 Infinite Scroll Pagination

```
User scrolls to "See More" button in DailyDiscover
        │
        ▼
handleLoadMore() in DailyDiscover
        │
        ▼ fetch(`/api/products?page=${page}&limit=12`)
GET /api/products Route Handler
        │
        ▼ getDailyProducts(12, page)
Supabase Postgres
        │
        ▼ returns Product[]
        │
        ▼ JSON response
DailyDiscover appends to state.products
If returned < 12 → setHasMore(false) → hide "See More"
```

### 15.3 Add to Cart

```
User hovers ProductCard → "ADD TO CART" button appears
        │
        ▼ onClick
addToCart(product) from useCart()
        │
        ▼ dispatch({ type: "ADD", payload: product })
CartReducer:
  - Find item with same id
  - If exists: increment quantity
  - If not: push new CartItem (qty=1)
        │
        ▼ new state
useEffect: localStorage.setItem("cart", JSON.stringify(items))
CartIcon badge re-renders with updated count
```

---

## 16. Security Design

### 16.1 Authentication Security

- **JWT Validation:** Supabase middleware runs on every request to validate and refresh JWTs. Tokens are stored in HttpOnly cookies (managed by `@supabase/ssr`), not accessible to JavaScript.
- **OAuth Callback:** The `/auth/callback` route validates the code with Supabase before establishing sessions — no open redirect vulnerability since Supabase validates the nonce.

### 16.2 Stripe Security

- Stripe Secret Key is **server-side only** — never sent to the client, never in `NEXT_PUBLIC_*` vars.
- Checkout sessions are created server-side — the client only receives the hosted Checkout URL.
- No card data touches the application server — all card processing is on Stripe's domain.

### 16.3 Database Security

- **Row Level Security (RLS)** is enabled on the `products` table.
- The public read policy allows `SELECT` for all users, but no `INSERT/UPDATE/DELETE` is permitted via the anon key.
- Product mutations only happen via the server-side seed script using the service role.
- Direct PostgreSQL connections use `POSTGRES_URL_NON_POOLING` which is a server-only variable.

### 16.4 Input Handling

- The search query in `searchProducts` uses parameterized queries (`$1` placeholders) — no SQL injection risk.
- The checkout API validates that `items` is an array before mapping — basic input boundary check.

### 16.5 OWASP Top 10 Mitigations

| Risk | Mitigation |
|---|---|
| A01 Broken Access Control | RLS on DB; server-only secrets |
| A02 Cryptographic Failures | JWTs via Supabase; HTTPS enforced |
| A03 Injection | Parameterized SQL queries throughout |
| A05 Security Misconfiguration | Env vars for all credentials; no hardcoded secrets |
| A07 Auth Failures | Supabase JWT + session refresh middleware |

---

## 17. Performance Design

### 17.1 Caching & ISR

- Homepage uses **Incremental Static Regeneration** with `revalidate = 60`. Product data is stale-while-revalidate — users get fast cached HTML with product data refreshed in the background every 60 seconds.

### 17.2 Database Connection Pooling

- `pg.Pool` with `globalThis` singleton prevents connection leaks during Next.js hot-reload in development.
- Use `POSTGRES_URL_NON_POOLING` (direct connection) — appropriate for serverless functions that are short-lived.

### 17.3 Image Optimization

- Next.js Image component configured with `remotePatterns` for `lh3.googleusercontent.com`.
- Automatic WebP conversion, lazy loading, and responsive `srcset` generation.

### 17.4 JavaScript Bundle

- Server Components eliminate client-side JS for static sections (Hero, Category Nav, Flash Sale header).
- Only interactive components (`DailyDiscover`, `ProductCard`, `CartDrawer`, etc.) ship to the browser.
- `"use client"` boundary is applied at the lowest possible level.

### 17.5 Pagination

- Daily Discover loads 12 items initially (server-rendered), then fetches 12 more per user action.
- Avoids large initial data payloads — 10,000 products in DB are never bulk-fetched.

---

## 18. Known Limitations & Future Work

### Current Gaps

| Issue | Location | Impact |
|---|---|---|
| Legacy static data unused in production | `src/lib/products.ts` | Dead code, should be removed |
| Price unit ambiguity in Stripe | `api/checkout/route.ts` | VND prices multiplied by 100 — incorrect for VND (no sub-units) |
| No route protection | `middleware.ts` | Checkout accessible without login |
| Payment method stubs | `CheckoutContent.tsx` | COD/ShopeePay/Banking do nothing |
| No order persistence | — | Orders exist only in Stripe, not saved to DB |
| No product detail page | — | No `/product/[id]` route exists |
| Search bar not wired | `Header.tsx` | UI only — no search results page |
| Category nav not wired | `page.tsx` | Icons present, no category filter page |
| `getProductsByCategory` unused | `src/lib/db/products.ts` | Function exists but no route or page calls it |

### Suggested Improvements

1. **Order management:** Add `orders` and `order_items` tables, save Stripe session data post-payment.
2. **Protected checkout:** Add middleware route matcher for `/checkout` requiring auth.
3. **Product detail page:** Implement `/product/[id]` (SSG or ISR per product).
4. **Search:** Wire Header search to `/search?q=` page using `searchProducts()`.
5. **Currency fix:** VND has no sub-units — remove the `× 100` multiplication or convert to USD.
6. **User profile:** Leverage Supabase Auth user data for profile/order history pages.
7. **Wishlist:** Client or server-persisted wishlist per user.
