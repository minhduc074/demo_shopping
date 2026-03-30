# Demo Shopping — Detailed Technical Design

> **Audience:** Engineers building, extending, or maintaining this codebase.

---

## Table of Contents

1. [Repository Map](#1-repository-map)
2. [Runtime & Dependency Graph](#2-runtime--dependency-graph)
3. [Next.js App Router Structure](#3-nextjs-app-router-structure)
4. [Rendering Model Per Route](#4-rendering-model-per-route)
5. [Middleware Pipeline](#5-middleware-pipeline)
6. [Supabase Client Strategy](#6-supabase-client-strategy)
7. [Database Schema & Queries](#7-database-schema--queries)
8. [Cart: State Machine Design](#8-cart-state-machine-design)
9. [API Route Contracts](#9-api-route-contracts)
10. [Authentication Flows](#10-authentication-flows)
11. [Stripe Checkout Flow](#11-stripe-checkout-flow)
12. [Component Architecture](#12-component-architecture)
13. [Styling System](#13-styling-system)
14. [Testing Design](#14-testing-design)
15. [Environment Variables](#15-environment-variables)
16. [Data Seeding](#16-data-seeding)
17. [Known Issues & Debt](#17-known-issues--debt)

---

## 1. Repository Map

```
demo_shopping/
├── next.config.ts                 # Next.js config: image remote patterns
├── tsconfig.json                  # TS: strict, baseUrl ".", @/* alias → src/*
├── jest.config.ts                 # Jest: jsdom, ts-jest, moduleNameMapper
├── jest.setup.ts                  # import @testing-library/jest-dom
├── postcss.config.mjs             # Tailwind v4 PostCSS plugin
├── package.json
│
├── scripts/
│   └── seed.mjs                   # Node script: drops + creates + seeds 10k products
│
├── stitch/                        # Static HTML/CSS mockups (not part of runtime)
│
└── src/
    ├── middleware.ts              # Edge: Supabase session refresh on every request
    ├── __mocks__/fileMock.ts      # Jest stub: returns "test-file-stub" for asset imports
    │
    ├── app/                       # Next.js App Router root
    │   ├── globals.css            # Tailwind v4 @theme layer + custom design tokens
    │   ├── layout.tsx             # RootLayout: CartProvider wraps the entire tree
    │   ├── page.tsx               # Route /: ISR homepage (revalidate=60)
    │   │
    │   ├── api/
    │   │   ├── checkout/route.ts  # POST /api/checkout → Stripe session
    │   │   └── products/route.ts  # GET /api/products?page&limit → paginated products
    │   │
    │   ├── auth/callback/route.ts # GET /auth/callback → OAuth code exchange
    │   │
    │   ├── checkout/
    │   │   ├── page.tsx           # Static shell with progress bar
    │   │   ├── CheckoutContent.tsx # CC: cart → Stripe redirect
    │   │   └── success/
    │   │       ├── page.tsx       # Static shell, Suspense wrapper
    │   │       └── ClearCartOnSuccess.tsx  # CC: reads session_id, clears cart
    │   │
    │   └── login/
    │       ├── page.tsx           # Static shell, bg image
    │       └── LoginForm.tsx      # CC: email/password + OAuth
    │
    ├── components/
    │   ├── Header.tsx             # SC: variant="full|login|checkout"
    │   ├── Footer.tsx             # SC: pure static
    │   ├── AuthActions.tsx        # CC: Supabase onAuthStateChange
    │   ├── CartIcon.tsx           # CC: useCart() count badge
    │   ├── CartDrawer.tsx         # CC: slide-in panel, qty controls
    │   ├── ProductCard.tsx        # CC: hover → addToCart
    │   └── DailyDiscover.tsx      # CC: paginated fetch, "See More"
    │
    └── lib/
        ├── products.ts            # Legacy static data (unused in prod)
        ├── stripe.ts              # Stripe SDK singleton
        ├── cart/context.tsx       # CartProvider, CartReducer, useCart
        ├── db/products.ts         # pg Pool singleton + query functions
        └── supabase/
            ├── client.ts          # createBrowserClient
            ├── server.ts          # createServerClient (cookies adapter)
            └── middleware.ts      # updateSession
```

**SC** = Server Component, **CC** = Client Component (`"use client"`)

---

## 2. Runtime & Dependency Graph

```
next@15.3.1 (App Router, React Server Components)
  └── react@19.1.0 + react-dom@19.1.0

Auth:
  @supabase/supabase-js@2.49.4   ← browser + server Supabase client
  @supabase/ssr@0.6.1            ← cookie-based session adapter for Next.js

Database:
  pg@8.20.0                      ← direct PostgreSQL Pool (server-only)

Payments:
  stripe@17.7.0                  ← server-side Stripe SDK
  @stripe/stripe-js@5.6.0        ← browser Stripe.js (not yet used; loaded via <script>)

Styling:
  tailwindcss@4.1.3 + @tailwindcss/postcss@4.1.3 + postcss@8.5.3

Testing:
  jest@29.7.0 + jest-environment-jsdom@29.7.0
  ts-jest@29.4.6
  @testing-library/react@16.3.2
  @testing-library/jest-dom@6.9.1
  @testing-library/user-event@14.6.1
```

---

## 3. Next.js App Router Structure

### Layout Tree

```
RootLayout  [src/app/layout.tsx]
│  font: Inter (next/font/google)
│  Google Material Symbols stylesheet (CDN)
│  CartProvider (wraps entire tree)
│  CartDrawer (always mounted, conditionally visible)
│
├── /                      page.tsx       (RSC, revalidate=60)
├── /login                 login/page.tsx (RSC shell → LoginForm CC)
├── /checkout              checkout/page.tsx (RSC shell → CheckoutContent CC)
├── /checkout/success      success/page.tsx (RSC → Suspense → ClearCartOnSuccess CC)
├── /api/checkout          route.ts (Route Handler, POST)
├── /api/products          route.ts (Route Handler, GET)
└── /auth/callback         route.ts (Route Handler, GET)
```

### File Conventions

| Convention | Use |
|---|---|
| `page.tsx` | Route segment UI |
| `route.ts` | API endpoint (no UI) |
| `layout.tsx` | Shared UI wrapper |
| `*.test.tsx` | Co-located test file |
| `"use client"` at top | Marks Client Component boundary |

---

## 4. Rendering Model Per Route

| Route | Strategy | Export | Behavior |
|---|---|---|---|
| `/` | ISR | `export const revalidate = 60` | Cached HTML rebuilt in background every 60s. First request after expiry gets stale, triggers regen. |
| `/login` | Static (SSG) | — | No dynamic data; compiled at build time. |
| `/checkout` | Static shell + CC | — | Page HTML is static; cart data hydrated client-side from localStorage. |
| `/checkout/success` | Static shell + CC in Suspense | — | `useSearchParams()` requires Suspense boundary; CC reads `?session_id` from URL. |
| `GET /api/products` | Dynamic | — | Called at runtime on each request; no caching. |
| `POST /api/checkout` | Dynamic | — | Must be fresh per request to create unique Stripe session. |
| `GET /auth/callback` | Dynamic | — | OAuth code is one-time use; must not be cached. |

### ISR on Homepage

```typescript
// src/app/page.tsx
export const revalidate = 60;

export default async function HomePage() {
  const [flashSale, daily] = await Promise.all([
    getFlashSaleProducts(6),
    getDailyProducts(12, 1),
  ]);
  // ...renders with data
}
```

Both DB calls run in parallel (`Promise.all`). The page is rendered once and cached. A background request regenerates it after 60 seconds.

---

## 5. Middleware Pipeline

**File:** `src/middleware.ts`

```typescript
export async function middleware(request: NextRequest) {
  return await updateSession(request);   // src/lib/supabase/middleware.ts
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

### What `updateSession` Does

```
Incoming request
      │
      ▼
createServerClient() with req/res cookie adapters
      │
      ▼
supabase.auth.getUser()         ← validates JWT; triggers token refresh if near expiry
      │
      ├─ Token valid    → copy updated Set-Cookie headers to response → NextResponse.next()
      └─ Token invalid  → clear session cookies → NextResponse.next() (no redirect)
```

**Important:** The middleware does **not** enforce protected routes — it only refreshes sessions. Route-level auth checks must be added explicitly.

---

## 6. Supabase Client Strategy

Three separate clients are required by `@supabase/ssr` to correctly handle cookies in each execution context:

### 6.1 Browser Client — `src/lib/supabase/client.ts`

```typescript
import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

- Used in: `AuthActions.tsx`, `LoginForm.tsx`
- Reads + writes cookies via the browser's `document.cookie`
- Subscribes to `onAuthStateChange` for reactive auth state

### 6.2 Server Client — `src/lib/supabase/server.ts`

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      },
    },
  });
}
```

- Used in: Route Handlers, Server Components (not currently called in app code — available for auth-gating)
- Cookie writes may throw in RSC contexts (read-only); wrapped in try/catch

### 6.3 Middleware Client — `src/lib/supabase/middleware.ts`

```typescript
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  await supabase.auth.getUser();   // side effect: refreshes token + sets cookie
  return supabaseResponse;
}
```

- Must return the `supabaseResponse` object unchanged to propagate `Set-Cookie` headers

---

## 7. Database Schema & Queries

### 7.1 Table Definition

```sql
CREATE TABLE public.products (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT         NOT NULL,
  price          INTEGER      NOT NULL,           -- whole VND, e.g. 150000
  original_price INTEGER      NOT NULL,
  discount       INTEGER      NOT NULL DEFAULT 0, -- 0-100 percent
  image          TEXT         NOT NULL,           -- absolute URL
  sold_count     INTEGER      NOT NULL DEFAULT 0,
  rating         NUMERIC(3,1)          DEFAULT 4.5,
  category       TEXT         NOT NULL,
  is_flash_sale  BOOLEAN      NOT NULL DEFAULT false,
  is_mall        BOOLEAN      NOT NULL DEFAULT false,
  is_new         BOOLEAN      NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ           DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_products_category    ON public.products(category);
CREATE INDEX idx_products_flash_sale  ON public.products(is_flash_sale);
CREATE INDEX idx_products_price       ON public.products(price);
CREATE INDEX idx_products_sold_count  ON public.products(sold_count DESC);
CREATE INDEX idx_products_created_at  ON public.products(created_at DESC);

-- RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.products
  FOR SELECT USING (true);
```

### 7.2 Connection Pool Singleton

**File:** `src/lib/db/products.ts`

```typescript
import { Pool } from "pg";

// Survive Next.js hot-reload in dev by storing on globalThis
const globalForPool = globalThis as typeof globalThis & { pgPool?: Pool };

if (!globalForPool.pgPool) {
  globalForPool.pgPool = new Pool({
    connectionString: process.env.POSTGRES_URL_NON_POOLING,
  });
}

export const pool = globalForPool.pgPool;
```

**Why `POSTGRES_URL_NON_POOLING`?** Supabase exposes two connection strings: a pooled one (via PgBouncer, ideal for many short-lived connections) and a direct one. For Next.js serverless functions which are short-lived, the direct connection avoids PgBouncer session-mode overhead.

### 7.3 Query Functions

```typescript
// Flash sale products — sorted by popularity
export async function getFlashSaleProducts(limit = 6): Promise<Product[]> {
  const result = await pool.query(
    `SELECT * FROM products
     WHERE is_flash_sale = true
     ORDER BY sold_count DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}

// Daily discover — paginated, non-flash-sale
export async function getDailyProducts(limit = 12, page = 1): Promise<Product[]> {
  const offset = (page - 1) * limit;
  const result = await pool.query(
    `SELECT * FROM products
     WHERE is_flash_sale = false
     ORDER BY sold_count DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
}

// Category filter — not yet used in UI
export async function getProductsByCategory(
  category: string, limit = 20, page = 1
): Promise<Product[]> { ... }

// Full-text search — not yet wired to UI
export async function searchProducts(
  query: string, limit = 20
): Promise<Product[]> {
  const result = await pool.query(
    `SELECT * FROM products
     WHERE name ILIKE $1 OR category ILIKE $1
     ORDER BY sold_count DESC
     LIMIT $2`,
    [`%${query}%`, limit]          // parameterized — no SQL injection risk
  );
  return result.rows;
}
```

### 7.4 Product TypeScript Interface

```typescript
export interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number;
  discount: number;
  image: string;
  sold_count: number;
  rating: number;
  category: string;
  is_flash_sale: boolean;
  is_mall: boolean;
  is_new: boolean;
}
```

> **Note:** `src/lib/products.ts` defines a different `Product` interface with static data. This legacy file predates the DB layer. Use `src/lib/db/products.ts` for all runtime data.

---

## 8. Cart: State Machine Design

**File:** `src/lib/cart/context.tsx`

### 8.1 State Shape

```typescript
interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}
```

### 8.2 Action Union Type

```typescript
type CartAction =
  | { type: "ADD";        payload: CartItem }
  | { type: "REMOVE";     payload: { id: string } }
  | { type: "UPDATE_QTY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR" }
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "HYDRATE";    payload: CartItem[] }
```

### 8.3 Reducer Logic

```
ADD:
  Find existing item with payload.id
  → Exists: return items with incremented quantity
  → Not found: append new CartItem with quantity=1

REMOVE:
  Filter out item where id === payload.id

UPDATE_QTY:
  If payload.quantity <= 0 → remove item
  Else → update item's quantity

CLEAR:
  items: []

OPEN / CLOSE:
  Toggle isOpen boolean

HYDRATE:
  Replace items with payload (called once on mount from localStorage)
```

### 8.4 Persistence

```typescript
// On mount: read from localStorage
useEffect(() => {
  const stored = localStorage.getItem("cart");
  if (stored) {
    dispatch({ type: "HYDRATE", payload: JSON.parse(stored) });
  }
}, []);

// On every items change: write to localStorage
useEffect(() => {
  localStorage.setItem("cart", JSON.stringify(state.items));
}, [state.items]);
```

### 8.5 Derived Values

```typescript
const count = state.items.reduce((sum, item) => sum + item.quantity, 0);
const total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
```

### 8.6 Context API (useCart)

```typescript
interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  count: number;
  total: number;
  addToCart:      (product: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart:      () => void;
  openCart:       () => void;
  closeCart:      () => void;
}
```

Consuming components call `useCart()` — throws if used outside `CartProvider`.

---

## 9. API Route Contracts

### 9.1 `GET /api/products`

**Handler:** `src/app/api/products/route.ts`

```
Request
  GET /api/products?page=2&limit=12

Query parsing
  page  = Number(searchParams.get("page"))  || 1
  limit = Number(searchParams.get("limit")) || 12

DB call
  getDailyProducts(limit, page)

Success response  HTTP 200
  Content-Type: application/json
  { "products": Product[] }

Error response    HTTP 500
  { "error": string }
```

**Pagination formula:**
```
offset = (page - 1) * limit
SELECT ... LIMIT limit OFFSET offset
```

End-of-data signal: client (DailyDiscover) checks `response.products.length < limit` → sets `hasMore = false`.

---

### 9.2 `POST /api/checkout`

**Handler:** `src/app/api/checkout/route.ts`

```
Request
  POST /api/checkout
  Content-Type: application/json
  {
    "items": [
      { "id": string, "name": string, "price": number, "quantity": number, "image": string }
    ]
  }

Stripe line_items mapping
  items.map(item => ({
    price_data: {
      currency: "usd",
      product_data: { name: item.name, images: [item.image] },
      unit_amount: Math.round(item.price * 100),   // ⚠️ BUG: price is VND integer
    },
    quantity: item.quantity,
  }))

stripe.checkout.sessions.create({
  payment_method_types: ["card"],
  line_items,
  mode: "payment",
  success_url: `${BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url:  `${BASE_URL}/checkout`,
})

Success response  HTTP 200
  { "url": "https://checkout.stripe.com/pay/cs_test_..." }

Error response    HTTP 500
  { "error": string }
```

**Known bug:** `unit_amount = price * 100`. VND should be passed as the integer value directly (Stripe uses zero-decimal currency for VND). Multiplying by 100 inflates the charge.

---

### 9.3 `GET /auth/callback`

**Handler:** `src/app/auth/callback/route.ts`

```
Request
  GET /auth/callback?code=abc123&next=/dashboard

Flow
  supabase = createClient()                    (server client)
  code = searchParams.get("code")
  next = searchParams.get("next") || "/"

  if (code):
    await supabase.auth.exchangeCodeForSession(code)
    → on success: redirect(next)
    → on error:   redirect("/login?message=Could not authenticate user")

  else:
    redirect("/login?message=No code provided")
```

---

## 10. Authentication Flows

### 10.1 Email/Password Sign-In

```typescript
// LoginForm.tsx — sign in
const { error } = await supabase.auth.signInWithPassword({ email, password });

// LoginForm.tsx — sign up
const { error } = await supabase.auth.signUp({ email, password });
```

On success: Supabase sets `sb-*-auth-token` cookie → `onAuthStateChange` fires → `AuthActions` re-renders with username.

### 10.2 OAuth Sign-In (Google / Facebook / Apple)

```typescript
supabase.auth.signInWithOAuth({
  provider: "google" | "facebook" | "apple",
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
});
```

Full sequence:
```
LoginForm → signInWithOAuth()
         → browser redirect to provider
         → user consents
         → provider redirects to /auth/callback?code=...
         → exchangeCodeForSession(code) sets session cookie
         → redirect to / or ?next=
         → onAuthStateChange fires in AuthActions → username shown
```

### 10.3 Sign-Out

```typescript
// AuthActions.tsx
await supabase.auth.signOut();
// onAuthStateChange fires with event="SIGNED_OUT", session=null
// setUser(null) → shows login/register links
```

### 10.4 Session Persistence

| Surface | Cookie name | Lifetime |
|---|---|---|
| Browser | `sb-<project-ref>-auth-token` | Per Supabase project config (default: 1 hour, auto-refreshed) |
| Server | Same cookie, read via `cookies()` | Same |

The middleware extends sessions transparently — users remain logged in as long as they visit the site within the token TTL window.

---

## 11. Stripe Checkout Flow

### 11.1 Sequence

```
CheckoutContent
  useCart() → items[]
  user fills form, clicks "Place Order"
        │
        ▼
  fetch("POST /api/checkout", { body: JSON.stringify({ items }) })
        │
        ▼  (server-side)
  stripe.checkout.sessions.create({
    line_items: items.map(→ stripe format),
    mode: "payment",
    success_url: BASE_URL + "/checkout/success?session_id={CHECKOUT_SESSION_ID}",
    cancel_url:  BASE_URL + "/checkout",
  })
        │
        ▼
  returns { url }
        │
        ▼  (back in browser)
  window.location.href = url      ← navigates to Stripe hosted page
        │
        ▼  (after payment)
  Stripe redirects to /checkout/success?session_id=cs_...
        │
        ▼
  ClearCartOnSuccess mounts
  useSearchParams() reads session_id (proves payment intent)
  clearCart() → dispatch CLEAR → localStorage cleared
```

### 11.2 Stripe SDK Initialization

```typescript
// src/lib/stripe.ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});
```

Singleton — imported once into `api/checkout/route.ts`.

### 11.3 Price Unit Issue

Stripe's `unit_amount` is in the **smallest currency unit**. For USD: cents. For VND: đồng (VND has no sub-units — it is a zero-decimal currency in Stripe's system).

Current code: `unit_amount: Math.round(item.price * 100)` — this multiplies a VND integer by 100, creating a charge 100× larger than intended. Fix: pass `item.price` directly and set `currency: "vnd"`.

---

## 12. Component Architecture

### 12.1 Component Dependency Tree

```
RootLayout
│
├── CartProvider (context)
│     └── CartDrawer ──── useCart()
│
└── Page tree
      ├── Header
      │     ├── AuthActions ──── supabase.auth (browser client)
      │     └── CartIcon ──────── useCart()
      │
      ├── [page content]
      │     ├── ProductCard ──── useCart() → addToCart
      │     └── DailyDiscover ── fetch /api/products
      │
      └── Footer
```

### 12.2 Header Variant Switch

```typescript
// src/components/Header.tsx
type HeaderVariant = "full" | "login" | "checkout";

interface HeaderProps {
  variant?: HeaderVariant;  // default: "full"
}
```

| Variant | Rendered Elements |
|---|---|
| `full` | Logo, Search input + button, Region selector, AuthActions, CartIcon, Nav links row |
| `login` | Logo + tagline (centered), "Need help?" text only |
| `checkout` | Logo, CartIcon (no search, no nav) |

### 12.3 DailyDiscover Pagination

```typescript
// State
const [products, setProducts] = useState<Product[]>(initialProducts);
const [page, setPage] = useState(2);           // starts at 2 (page 1 from SSR)
const [hasMore, setHasMore] = useState(true);
const [loading, setLoading] = useState(false);

// Load more
async function handleLoadMore() {
  setLoading(true);
  const res = await fetch(`/api/products?page=${page}&limit=12`);
  const data = await res.json();

  setProducts(prev => [...prev, ...data.products]);
  setPage(prev => prev + 1);

  if (data.products.length < 12) setHasMore(false);  // end of data
  setLoading(false);
}
```

### 12.4 ProductCard Hover State

ProductCard uses CSS group hover (Tailwind `group` + `group-hover:opacity-100`) to show the "ADD TO CART" overlay. The `addToCart` call:

```typescript
addToCart({
  id: product.id,
  name: product.name,
  price: product.price,
  image: product.image,
  // quantity added by reducer (defaults to 1, or increments existing)
});
```

### 12.5 ClearCartOnSuccess and Suspense

`useSearchParams()` requires a Suspense boundary in Next.js App Router. The page wraps it:

```typescript
// success/page.tsx
export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClearCartOnSuccess />
    </Suspense>
  );
}

// ClearCartOnSuccess.tsx
"use client";
export default function ClearCartOnSuccess() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId) clearCart();
  }, [searchParams, clearCart]);

  return <>{/* confirmation UI */}</>;
}
```

---

## 13. Styling System

### 13.1 Tailwind v4 Theme Setup

`globals.css` uses the new `@theme` directive (Tailwind v4) instead of `tailwind.config.js`:

```css
@import "tailwindcss";

@theme {
  --color-primary:          #b22203;   /* Shopee red */
  --color-primary-container: #fde8e4;
  --color-surface:           #ffffff;
  --color-surface-variant:   #f5f5f5;
  --color-on-surface:        #1a1a1a;
  --color-outline:           #e0e0e0;
  --font-sans:               "Inter", sans-serif;
}
```

### 13.2 Custom Utilities

```css
/* Hide scrollbar (cross-browser) */
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

/* Product card hover lift effect */
.product-card-hover {
  transition: transform 0.2s, box-shadow 0.2s;
}
.product-card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}
```

### 13.3 Design Tokens

Based on Material You (M3) color system adapted with Shopee's brand color (`#b22203`):

| Token | Value | Usage |
|---|---|---|
| `--color-primary` | `#b22203` | Buttons, badges, active states |
| `--color-primary-container` | `#fde8e4` | Flash sale background tint |
| `--color-surface` | `#ffffff` | Card backgrounds |
| `--color-surface-variant` | `#f5f5f5` | Page backgrounds |
| `--color-outline` | `#e0e0e0` | Borders, dividers |

---

## 14. Testing Design

### 14.1 Jest Configuration

```typescript
// jest.config.ts
const config: Config = {
  testEnvironment: "jsdom",         // browser-like globals: window, document, localStorage
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  transform: {
    "^.+\\.(t|j)sx?$": ["ts-jest", { tsconfig: { jsx: "react-jsx" } }],
  },

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",               // resolve path alias
    "\\.(css|scss|sass)$": "identity-obj-proxy",  // CSS modules → proxy
    "\\.(png|jpg|jpeg|gif|svg|webp)$": "<rootDir>/src/__mocks__/fileMock.ts",
  },

  testMatch: ["**/*.test.ts", "**/*.test.tsx"],

  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/app/layout.tsx",       // Root layout hard to unit test
    "!src/middleware.ts",        // Edge runtime
    "!src/lib/stripe.ts",        // SDK singleton
    "!src/lib/supabase/**",      // External SDK adapters
  ],
};
```

### 14.2 Mocking Patterns

**Supabase browser client** (per-test file):
```typescript
jest.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));
```

**Fetch API:**
```typescript
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ products: mockProducts }),
  } as Response)
);
```

**Cart context** (when testing components that use useCart):
```typescript
jest.mock("@/lib/cart/context", () => ({
  useCart: () => ({
    items: [],
    count: 0,
    total: 0,
    addToCart: jest.fn(),
    openCart: jest.fn(),
    // ...
  }),
}));
```

### 14.3 Test Coverage by Layer

| Layer | File | What to test |
|---|---|---|
| State | `cart/context.test.tsx` | All reducer actions, localStorage hydration, derived values |
| API | `api/checkout/route.test.ts` | Stripe mock, line_items mapping, error handling |
| API | `api/products/route.test.ts` | Pagination math, DB mock, response shape |
| Auth | `auth/callback/route.test.ts` | Code exchange success + failure redirect |
| Components | `ProductCard.test.tsx` | addToCart called on button click |
| Components | `CartDrawer.test.tsx` | Items rendered, qty controls, subtotal display |
| Components | `AuthActions.test.tsx` | Login/logout UI toggle on auth state change |
| Components | `DailyDiscover.test.tsx` | Initial render, "See More" fetch, hasMore logic |

### 14.4 Run Commands

```bash
# Run all tests
npx jest

# Run with coverage
npx jest --coverage

# Run single file
npx jest src/lib/cart/context.test.tsx

# Watch mode
npx jest --watch
```

---

## 15. Environment Variables

| Variable | Access | Required | Description |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | ✅ | `https://<project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | ✅ | Public anon key from Supabase dashboard |
| `POSTGRES_URL_NON_POOLING` | Server only | ✅ | `postgresql://postgres:<password>@<host>:5432/postgres` |
| `STRIPE_SECRET_KEY` | Server only | ✅ | `sk_test_...` or `sk_live_...` |
| `NEXT_PUBLIC_BASE_URL` | Client + Server | ✅ | `http://localhost:3000` (dev) / production URL |

### Setting Up `.env.local`

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
POSTGRES_URL_NON_POOLING=postgresql://postgres:password@db.xxxx.supabase.co:5432/postgres
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Security rules:**
- Never commit `.env.local`
- Variables without `NEXT_PUBLIC_` are never bundled into client JS
- The Supabase anon key is safe to expose — RLS enforces data access on the DB

---

## 16. Data Seeding

**File:** `scripts/seed.mjs`

```bash
node scripts/seed.mjs
```

### What It Does

1. Connects to Postgres via `POSTGRES_URL_NON_POOLING`
2. Drops `public.products` if exists
3. Creates table + indexes + RLS policy
4. Generates **10,000 products** using a template matrix:
   - 12 categories × 15 name templates = 180 base names
   - Each decorated with 1 of 5 adjectives (Premium, Ultra, Pro, Smart, Eco)
   - Random: price (50k–2M VND), discount (10–70%), sold_count (100–50k), rating (3.5–5.0)
   - ~10% `is_flash_sale = true`, ~20% `is_mall = true`, ~15% `is_new = true`
   - Images from `picsum.photos` with seeded random IDs for variety
5. Inserts in **batches of 500** rows

### Category Templates

```
Electronics, Fashion, Home & Living, Beauty & Personal Care,
Sports & Outdoors, Books & Media, Toys & Games, Food & Beverages,
Automotive, Health & Wellness, Garden & Outdoor, Pet Supplies
```

---

## 17. Known Issues & Debt

| ID | Location | Issue | Severity |
|---|---|---|---|
| D1 | `api/checkout/route.ts` | `unit_amount = price * 100` is wrong for VND (zero-decimal currency) | 🔴 High |
| D2 | `src/lib/products.ts` | Legacy static product data — dead code in production | 🟡 Low |
| D3 | `middleware.ts` | No route protection — `/checkout` accessible without auth | 🟠 Medium |
| D4 | `CheckoutContent.tsx` | COD / ShopeePay / Banking payment options are UI stubs only | 🟡 Low |
| D5 | `app/page.tsx` | Category navigation icons have no `href` — no category pages exist | 🟡 Low |
| D6 | `Header.tsx` | Search bar has no action — no `/search` route exists | 🟡 Low |
| D7 | — | No order persistence — completed orders are only in Stripe, not in DB | 🟠 Medium |
| D8 | `db/products.ts` | `getProductsByCategory` and `searchProducts` are never called from any route | 🟡 Low |
| D9 | `success/page.tsx` | `session_id` in URL is not verified against Stripe API — any random string clears the cart | 🟠 Medium |

### Fix Priorities

**D1 — Stripe price fix:**
```typescript
// Current (wrong):
unit_amount: Math.round(item.price * 100),
currency: "usd",

// Correct for VND:
unit_amount: item.price,   // VND is zero-decimal in Stripe
currency: "vnd",
```

**D9 — Verify session before clearing cart:**
```typescript
// In ClearCartOnSuccess or a new API route:
const session = await stripe.checkout.sessions.retrieve(sessionId);
if (session.payment_status === "paid") clearCart();
```

**D3 — Protect checkout route:**
```typescript
// Add to middleware.ts:
const { data: { user } } = await supabase.auth.getUser();
if (!user && request.nextUrl.pathname.startsWith("/checkout")) {
  return NextResponse.redirect(new URL("/login?next=/checkout", request.url));
}
```
