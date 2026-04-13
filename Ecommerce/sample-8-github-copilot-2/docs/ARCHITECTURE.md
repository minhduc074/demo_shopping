# Kiến Trúc Hệ Thống — The Editorial Marketplace

## 1. Tổng Quan Kiến Trúc

Dự án áp dụng kiến trúc **Modular Monolith** — backend Express.js đơn lẻ với các modules rõ ràng, triển khai như Vercel Serverless Functions. Frontend là Angular SPA tách biệt, triển khai Vercel Static Hosting.

```
┌─────────────────────────────────────────────────────────────┐
│                      PRODUCTION                             │
│                                                             │
│  ┌──────────────────┐        ┌──────────────────────────┐   │
│  │  Angular SPA     │  HTTPS │  Express API             │   │
│  │  Vercel Static   │◄──────►│  Vercel Serverless        │   │
│  │  (CDN Edge)      │        │  /api/index.ts handler   │   │
│  └──────────────────┘        └────────────┬─────────────┘   │
│                                           │                 │
│                              ┌────────────▼─────────────┐   │
│                              │  PostgreSQL               │   │
│                              │  (Neon / Supabase / RDS) │   │
│                              └──────────────────────────┘   │
│                                                             │
│                              ┌──────────────────────────┐   │
│                              │  Stripe API               │   │
│                              │  (Checkout + Webhooks)   │   │
│                              └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Backend Architecture

### 2.1 Request Flow
```
HTTP Request
    │
    ▼
Express App (api/index.ts)
    │
    ├─ CORS (allowlist frontend domain)
    ├─ cookie-parser
    ├─ express.json()
    │
    ▼
Router (src/routes/*.routes.ts)
    │
    ├─ authMiddleware (verify JWT từ cookie → req.user)
    ├─ adminMiddleware (kiểm tra role ADMIN)
    │
    ▼
Service Layer (src/services/*.service.ts)
    │
    ▼
Prisma ORM (src/lib/prisma.ts)
    │
    ▼
PostgreSQL Database
```

### 2.2 Authentication Flow (JWT Cookie)
```
POST /api/auth/login
    │
    ├─ Tìm user theo email
    ├─ So sánh password với bcrypt
    ├─ Tạo JWT { userId, email, role } (TTL 7 ngày)
    └─ Set-Cookie: token=<jwt>; httpOnly; sameSite=lax; secure (prod)

GET /api/auth/me  →  authMiddleware đọc cookie → verify JWT → req.user
GET /api/cart     →  authMiddleware → CartService.getCart(req.user.id)
```

### 2.3 Checkout Flow

#### COD:
```
POST /api/checkout { paymentMethod: "COD", address... }
    │
    ├─ Tải cart → validate products
    ├─ Tạo Order (status: CONFIRMED) + OrderItems
    ├─ Tạo Payment (method: COD, status: PAID)
    ├─ Xóa cart
    └─ Trả về { orderId, orderNumber }
```

#### Stripe:
```
POST /api/checkout { paymentMethod: "STRIPE", address... }
    │
    ├─ Tải cart → validate products
    ├─ Tạo Order (status: PENDING)
    ├─ Tạo Stripe Checkout Session (line items từ cart)
    ├─ Lưu stripeSessionId vào Order
    └─ Trả về { sessionUrl } → Frontend redirect đến Stripe

POST /api/webhooks/stripe  (từ Stripe servers)
    │
    ├─ Verify HMAC signature (STRIPE_WEBHOOK_SECRET)
    ├─ Sự kiện checkout.session.completed
    │   ├─ Tìm Order theo stripeSessionId
    │   ├─ Order.status → CONFIRMED
    │   └─ Payment.status → PAID
    └─ Sự kiện payment_intent.payment_failed
        └─ Order.status → CANCELLED, Payment.status → FAILED
```

---

## 3. Frontend Architecture (Angular 17)

### 3.1 Application Shell
```
index.html
└── AppComponent
    ├── HeaderComponent     # sticky nav, glassmorphism
    ├── ToastComponent      # global notification system
    ├── router-outlet       # lazy-loaded feature pages
    └── FooterComponent
```

### 3.2 Data Flow
```
Angular Component
    │
    ├─ inject(ProductService)
    │     └─ HttpClient.get('/api/products') 
    │           └─ credentialsInterceptor adds withCredentials:true
    │
    ├─ Signal-based state update
    │     └─ UI re-renders reactively
    │
    └─ ErrorInterceptor catches 401/403 → router.navigate
```

### 3.3 Build & Deploy
```
ng build --configuration=production
    → dist/frontend/browser/   (static HTML/JS/CSS)
    → Deploy to Vercel Static

vercel.json (frontend):
    rewrites: [{ source: "/(.*)", destination: "/index.html" }]
    → Enables SPA deep linking
```

---

## 4. Database Schema Diagram

```
User ──────────── Cart ──────────── CartItem ──── Product
  │                                                  │
  └──── Order ──── OrderItem ─────────────────────────┘
           │
           └──── Payment

Category ──── Product ──── ProductImage
```

---

## 5. Security Architecture

| Vấn đề bảo mật | Giải pháp |
|---|---|
| XSS | JWT lưu trong httpOnly cookie (không truy cập được từ JS) |
| CSRF | SameSite=Lax cookie + CORS allowlist cụ thể |
| SQL Injection | Prisma ORM parameterized queries |
| Brute Force | (prod) Rate limiting với express-rate-limit |
| Sensitive Data | Passwords băm bằng bcrypt (cost factor 12) |
| Stripe Webhooks | HMAC-SHA256 signature verification bắt buộc |
| CORS | Chỉ whitelist đúng frontend origin (`process.env.FRONTEND_URL`) |
| Admin routes | Double guard: authMiddleware + adminMiddleware |

---

## 6. Scalability Tiers

### Tier 1 — Hiện tại (Demo / Prototype)
- Vercel Hobby (cold start ~1s)
- Neon PostgreSQL (free tier)
- 0–1,000 req/day

### Tier 2 — Production nhỏ
- Vercel Pro (always warm, 3 regions)
- Neon Business hoặc Supabase Pro
- Prisma connection pooling (pgBouncer)
- Angular build → Vercel Edge Network CDN
- 1,000–50,000 req/day

### Tier 3 — Scale-up
- Thêm Redis (Upstash) để cache sản phẩm (TTL 5 phút)
- PostgreSQL read replica cho queries đọc
- BullMQ cho xử lý webhook bất đồng bộ
- 50,000+ req/day

---

## 7. Environment Variables Summary

### Backend
```
DATABASE_URL          PostgreSQL connection string (bắt buộc)
JWT_SECRET            Chuỗi bí mật ≥ 32 chars (bắt buộc)
JWT_EXPIRES_IN        7d (mặc định)
STRIPE_SECRET_KEY     sk_test_... hoặc sk_live_... (bắt buộc)
STRIPE_WEBHOOK_SECRET whsec_... từ `stripe listen` (bắt buộc)
FRONTEND_URL          URL frontend để CORS (bắt buộc)
PORT                  3001 (local dev)
```

### Frontend
```
VITE hoặc Angular environment file:
API_URL               URL backend API
```

---

## 8. CI/CD & Deployment

### Local Development
```bash
# Backend
cd source/backend
npm install
cp .env.example .env   # điền DATABASE_URL, JWT_SECRET, STRIPE_*
npx prisma db push
npx tsx prisma/seed.ts
npm run dev             # http://localhost:3001

# Frontend
cd source/frontend
npm install
npm start               # http://localhost:4200
```

### Vercel Deployment
```bash
# Backend: deploy như Vercel Serverless Function
cd source/backend
vercel --prod
# → Set env vars trong Vercel Dashboard

# Frontend: deploy như Static Site
cd source/frontend
npm run build
vercel --prod
# → Cần cập nhật environment.prod.ts với backend URL trước khi build
```

### Webhook Setup (Stripe local dev)
```bash
stripe listen --forward-to localhost:3001/api/webhooks/stripe
# Copy webhook secret (whsec_...) vào .env
```

---

## 9. Failure Mode Recovery

| Tình huống | Xử lý |
|---|---|
| DB down | Express trả 503, Angular hiện "Lỗi kết nối, thử lại" |
| Stripe API timeout | Order vẫn được tạo (PENDING), cron job kiểm tra lại |
| Webhook miss | Stripe tự retry 3 lần trong 24h |
| JWT hết hạn | errorInterceptor catch 401 → redirect đăng nhập |
| Cart race condition | Prisma upsert + unique constraint trên [cartId, productId] |
