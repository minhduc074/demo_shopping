# Sông Hồng Core Architecture

## Executive Summary
- Sông Hồng Core is designed as a modular monolith built with Next.js, TypeScript, PostgreSQL, Redis, and Stripe.
- The system optimizes for fast MVP delivery while preserving clean domain boundaries so checkout, orders, and notifications can be extracted later if scale demands it.
- PostgreSQL is the source of truth for products, carts, orders, and payments; Redis is reserved for caching, rate limiting, and short-lived session concerns.
- Stripe Checkout Sessions is the preferred payment integration for one-time purchases because it reduces PCI scope and operational risk.
- The production target is AWS on ECS Fargate with RDS PostgreSQL, ElastiCache Redis, S3, CloudFront, and GitHub Actions CI/CD.

## Phase 1 - Architecture

### 1.1 High-Level Architecture

#### Architecture Pattern
- Pattern: Modular Monolith
- Reasoning:
  - Faster to ship than microservices
  - Lower operational complexity
  - Strong transactional consistency for cart, checkout, and order flows
  - Easier debugging and local development
  - Future service extraction remains possible if module contracts are preserved

#### System Context Diagram
```text
+-------------------+         +------------------+
|   Customer User   |         |   Admin User     |
+---------+---------+         +---------+--------+
          |                             |
          v                             v
      +-------------------------------------+
      |         Web App / Admin UI          |
      |             Next.js UI              |
      +----------------+--------------------+
                       |
                       v
      +-------------------------------------+
      |      Application Backend Layer      |
      |  Auth | Catalog | Cart | Checkout   |
      | Orders | Payments | Admin | Notify  |
      +----+---------------+----------------+
           |               |
           |               +----------------------+
           |                                      |
           v                                      v
+-------------------+                 +----------------------+
| PostgreSQL (RDS)  |                 | Stripe Checkout/API  |
| system of record  |                 | payments             |
+-------------------+                 +----------------------+
           |
           v
+-------------------+      +-------------------+      +-------------------+
| Redis             |      | S3 + CloudFront   |      | Email Provider    |
| cache/session     |      | media assets      |      | notifications     |
+-------------------+      +-------------------+      +-------------------+
```

#### Component Overview
| Component | Responsibility |
|---|---|
| Next.js Storefront UI | Customer browsing, account, cart, checkout |
| Next.js Admin UI | Catalog and order management |
| API Layer | Request validation, routing, auth, serialization |
| Auth Module | Registration, login, session management, RBAC |
| Catalog Module | Product and category querying, search, merchandising |
| Cart Module | Cart lifecycle, item merge/update/remove, totals |
| Checkout Module | Checkout orchestration, shipping, totals validation |
| Payment Module | Stripe session creation and payment finalization |
| Order Module | Order creation, history, status lifecycle |
| Notification Module | Confirmation emails and async downstream actions |
| Persistence Layer | Prisma repositories over PostgreSQL |
| Cache Layer | Redis-backed cache and rate-limit storage |

### 1.2 Infrastructure & Deployment

#### Cloud Provider & Services
- Cloud: AWS
- Core services:
  - Route 53
  - CloudFront
  - Application Load Balancer
  - ECS Fargate
  - ECR
  - RDS PostgreSQL
  - ElastiCache Redis
  - S3
  - CloudWatch
  - Secrets Manager
  - Optional SQS/SNS for async expansion

#### Container Strategy
- Strategy: Docker + ECS Fargate
- Why:
  - Simpler than Kubernetes for current scale
  - Good autoscaling primitives
  - Clean path from local Docker to production runtime

#### CI/CD Pipeline
```text
GitHub Push / PR
  -> Install dependencies
  -> Lint
  -> Unit tests
  -> Integration tests
  -> Build Next.js app
  -> Build Docker image
  -> Prisma migration validation
  -> Push image to ECR
  -> Deploy to staging
  -> Smoke tests
  -> Manual approval
  -> Deploy to production
```

#### Environments
| Environment | Purpose |
|---|---|
| Dev | Local development with Docker or local Postgres/Redis, Stripe test keys |
| Staging | Production-like verification with isolated infra and Stripe test mode |
| Production | Live environment with real secrets, backups, monitoring, and autoscaling |

### 1.3 Data Architecture

#### Database Choices
- PostgreSQL:
  - Products
  - Categories
  - Users
  - Carts
  - Orders
  - Payments
  - Audit logs
- Redis:
  - Rate limiting
  - Session/cache support
  - Hot-read caching for catalog pages
- S3:
  - Product images
  - Admin uploads
  - Report exports

#### Data Flow
```text
User action
  -> Frontend request
  -> API route / server action
  -> Domain service
  -> PostgreSQL write
  -> Redis invalidate/update
  -> Optional Stripe call
  -> Outbox event
  -> Worker sends email / analytics
```

#### Storage Strategy
- Media:
  - Upload originals to S3
  - Serve through CloudFront
- Backups:
  - RDS snapshots
  - Point-in-time recovery
- Logs:
  - CloudWatch structured JSON logs

### 1.4 Security Architecture

#### Authentication & Authorization
- Customer auth:
  - Email/password or OAuth2/OIDC
- Admin auth:
  - Same identity provider with stricter access policy and MFA
- Session strategy:
  - HTTP-only, secure, same-site cookies
- Authorization:
  - RBAC roles: `customer`, `support`, `catalog_manager`, `admin`
  - Resource-level ownership checks for carts and orders

#### API Security
- HTTPS-only
- Zod input validation on all public mutations
- CSRF protection for cookie-authenticated mutations
- Rate limiting on:
  - auth endpoints
  - checkout/session creation
  - admin endpoints
- Idempotency keys for payment-sensitive actions

#### Secrets Management
- Production:
  - AWS Secrets Manager
- Dev:
  - `.env`
- Rotated secrets:
  - DB credentials
  - Stripe secret keys
  - session secrets

### 1.5 Non-functional Requirements

#### Scalability
- Horizontal scaling for app containers
- Vertical DB scaling first, then read replicas if needed
- Redis and CDN to reduce DB and app pressure

#### Availability & Fault Tolerance
- MVP target SLA: 99.5%
- Production target SLA: 99.9%
- Practices:
  - Multi-AZ RDS
  - ECS health checks and autoscaling
  - Retry with backoff for Stripe and email
  - Outbox for reliable async dispatch
  - Reconciliation job for payment/order mismatch recovery

#### Observability
- Logging:
  - Structured JSON logs
- Metrics:
  - throughput
  - latency
  - error rate
  - checkout conversion
- Tracing:
  - OpenTelemetry
- Suggested stack:
  - CloudWatch + OTEL, optionally Grafana later

## Phase 2 - Basic Design

### 2.1 Module Breakdown
| Module | Responsibility | Inputs | Outputs | Dependencies |
|---|---|---|---|---|
| Auth | User identity, session, RBAC | credentials, OAuth callback | current user session | PostgreSQL, Redis |
| Catalog | Product/category browsing | filters, slugs | list/detail DTOs | PostgreSQL, Redis, S3 |
| Cart | Cart persistence and totals | cart token, item actions | cart state | Catalog, PostgreSQL |
| Checkout | Purchase preparation | cart token, customer info | Stripe session | Cart, Payment |
| Payment | Stripe integration | totals, order context | payment session and final status | Stripe |
| Orders | Order persistence and history | successful checkout | order records | PostgreSQL |
| Admin | Product and order management | admin actions | admin views and updates | Auth, Catalog, Orders |
| Notifications | Email confirmations and async side effects | domain events | delivery status | Email provider |
| Audit | Admin action trail | actor and payload | append-only logs | PostgreSQL |

### 2.2 API Contract Design

#### Auth API
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Example request:
```json
{
  "email": "user@example.com",
  "password": "StrongPass123!"
}
```

Example response:
```json
{
  "user": {
    "id": "usr_123",
    "email": "user@example.com",
    "role": "customer"
  }
}
```

#### Catalog API
- `GET /api/products`
- `GET /api/products/:slug`
- `GET /api/categories`

Example response:
```json
{
  "items": [
    {
      "id": "prd_1",
      "slug": "ao-linen-voan-core",
      "name": "Áo Linen Voan Core",
      "price": 890000,
      "imageUrl": "https://cdn.example.com/p1.jpg",
      "inStock": true
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 24,
    "total": 120
  }
}
```

#### Cart API
- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:itemId`
- `DELETE /api/cart/items/:itemId`

Add item request:
```json
{
  "productId": "prd_1",
  "quantity": 1,
  "size": "M",
  "color": "Mặc định"
}
```

#### Checkout API
- `POST /api/checkout/session`
- `GET /api/checkout/session/:id`
- `POST /api/webhooks/stripe`

Response:
```json
{
  "sessionId": "cs_test_xxx",
  "url": "https://checkout.stripe.com/..."
}
```

#### Orders API
- `GET /api/orders`
- `GET /api/orders/:id`

#### Admin API
- `POST /api/admin/products`
- `PATCH /api/admin/products/:id`
- `POST /api/admin/products/:id/publish`
- `GET /api/admin/orders`

#### Error Model
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Product variant is invalid",
    "details": {
      "field": "size"
    },
    "requestId": "req_abc"
  }
}
```

### 2.3 Database Schema (Basic)

#### Entities
- User
- Session
- Role
- Category
- Product
- ProductImage
- ProductTag
- Cart
- CartItem
- Order
- OrderItem
- Payment
- Address
- AuditLog
- OutboxEvent

#### Relationships
- User 1:N Session
- User 1:N Order
- User 1:N Address
- Category 1:N Product
- Product 1:N ProductImage
- Product N:M Tag via ProductTag
- Cart 1:N CartItem
- Order 1:N OrderItem
- Order 1:1 Payment

#### Indexing Strategy Overview
- Unique:
  - `users.email`
  - `products.slug`
  - `orders.order_number`
  - `payments.provider_session_id`
- Search/list:
  - `products(category_id, status, featured, created_at desc)`
  - `orders(user_id, created_at desc)`
  - `cart_items(cart_id)`
  - `outbox_events(status, available_at)`

### 2.4 Core Workflow Diagrams

#### User Registration / Authentication
```text
User submits credentials
 -> Validate input
 -> Hash password / verify provider
 -> Create or load user
 -> Create session
 -> Set secure cookie
 -> Return profile
```

#### Core Business Flow: Purchase
```text
Browse catalog
 -> View product detail
 -> Add product to cart
 -> Update cart quantities
 -> Create Stripe checkout session
 -> Pay on Stripe
 -> Finalize order
 -> Persist payment and order items
 -> Clear cart
 -> Send confirmation event
```

#### Error Handling & Fallback
```text
If Stripe session creation fails
 -> Log error
 -> Return upstream failure
 -> Keep cart intact
 -> Offer retry

If order finalization fails after payment
 -> Persist reconciliation marker
 -> Alert operations
 -> Retry idempotently
```

## Phase 3 - Detailed Design

### 3.1 Folder / Project Structure
See [docs/folder-structure.md](./docs/folder-structure.md).

### 3.2 Key Component Design

#### CatalogService
```ts
interface GetProductsInput {
  categorySlug?: string;
  page: number;
  pageSize: number;
  sort?: "featured" | "price_asc" | "price_desc" | "newest";
}

interface ProductListItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string;
  inStock: boolean;
}

interface PaginatedProducts {
  items: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
}

class CatalogService {
  async getProducts(input: GetProductsInput): Promise<PaginatedProducts>;
  async getProductBySlug(slug: string): Promise<ProductDetail | null>;
}
```

Design notes:
- Uses repository + cache-aside pattern
- Maps DB entities into stable API DTOs
- Revalidates cached entries when admin updates catalog

#### CartService
```ts
interface AddCartItemInput {
  cartToken: string;
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

class CartService {
  async getOrCreateCart(cartToken?: string): Promise<Cart>;
  async addItem(input: AddCartItemInput): Promise<CartView>;
  async updateItemQuantity(itemId: string, quantity: number): Promise<CartView>;
  async clearCart(cartId: string): Promise<void>;
}
```

Design notes:
- Validates inventory and product existence
- Merges identical cart variants
- Uses transaction for multi-step cart mutations

#### CheckoutService
```ts
interface CreateCheckoutSessionInput {
  cartToken: string;
  customerId?: string;
}

class CheckoutService {
  async createStripeCheckoutSession(input: CreateCheckoutSessionInput): Promise<{ url: string; sessionId: string }>;
  async finalizeSuccessfulPayment(stripeSessionId: string): Promise<Order>;
}
```

Design notes:
- Server calculates authoritative totals
- Uses Stripe Checkout Sessions for one-time payments
- Finalization is idempotent
- On success, persists order, payment, and clears cart

#### AuthGuard
```ts
type Role = "customer" | "support" | "catalog_manager" | "admin";

function requireAuth(): Promise<AuthUser>;
function requireRole(roles: Role[]): Promise<AuthUser>;
```

Patterns used:
- Repository
- Service Layer
- Transaction Script
- Outbox Pattern
- Guard / Policy Enforcement

### 3.3 Detailed Database Schema
See [docs/database.sql](./docs/database.sql).

Migration notes:
- Use forward-only Prisma migrations
- Prefer additive changes first
- Backfill before reader switch
- Delete legacy columns in a later deploy

### 3.4 State Management Design

#### Store Shape
```ts
type AppState = {
  auth: {
    user: { id: string; email: string; role: string } | null;
    isAuthenticated: boolean;
  };
  cart: {
    itemCount: number;
    subtotal: number;
    items: Array<{
      id: string;
      productId: string;
      name: string;
      quantity: number;
      price: number;
    }>;
  };
  ui: {
    locale: "vi" | "en";
    notifications: Array<{ id: string; type: "success" | "error"; message: string }>;
  };
};
```

#### Data Fetching Strategy
- Server Components for initial page rendering
- React Query for client mutations and re-fetch
- Server Actions for low-friction mutations where appropriate

#### Caching & Revalidation
- Catalog pages:
  - cacheable
  - tag-based invalidation
- Cart and checkout:
  - always fresh
- Admin:
  - minimal cache

### 3.5 Inter-service Communication

#### Current Design
- In-process synchronous calls between modules

#### Future Extraction Strategy
- Sync:
  - REST for customer-facing services
- Async:
  - SQS-based event flow for notifications and analytics

#### Event Schema Example
```json
{
  "eventId": "evt_123",
  "topic": "order.paid",
  "occurredAt": "2026-04-06T08:00:00Z",
  "payload": {
    "orderId": "ord_123",
    "userId": "usr_123",
    "total": 1790000,
    "currency": "vnd"
  }
}
```

#### Retry & DLQ Strategy
- Exponential backoff
- Max 5 attempts
- Failed messages to DLQ or `failed` outbox state
- Alerting on sustained failure

### 3.6 Testing Strategy

#### Unit Test Scope
- Pricing logic
- Cart merge/update rules
- Auth guards
- Validation schemas
- Stripe request builders

#### Integration Test Plan
- Product read from PostgreSQL
- Add/remove/update cart items
- Create Stripe checkout session
- Finalize paid order
- Clear cart after success

#### E2E Scenarios
- Guest browse -> add to cart -> Stripe redirect
- Logged-in user checkout
- Payment cancelled -> cart preserved
- Success page -> cart cleared -> order persisted
- Admin updates product
- Unauthorized admin access blocked

#### Coverage Targets
- Unit: 80%+
- Integration: all critical commerce flows
- E2E: happy path + top edge cases

## Open Questions / Assumptions Made
- This document assumes Sông Hồng Core is a Vietnamese e-commerce web application.
- It assumes Next.js + TypeScript + PostgreSQL remains the preferred stack.
- It assumes Stripe Checkout is the primary payment flow for one-time purchases.
- It assumes customer and admin roles coexist in one product.
- It assumes current scale is MVP to mid-scale SaaS, not enterprise multi-region from day one.
