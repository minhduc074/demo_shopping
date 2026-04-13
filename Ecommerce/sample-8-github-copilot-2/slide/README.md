# Slide — Xây Dựng Ứng Dụng Với Vibe Coding

## "The Editorial Marketplace" — Angular + Express + PostgreSQL

---

## Slide 1: Vibe Coding Là Gì?

**Vibe Coding** là phương pháp lập trình dùng AI assistant (GitHub Copilot) để:
- Mô tả ý tưởng → AI hiểu "vibe" → sinh code
- Tập trung vào **thiết kế và logic nghiệp vụ**, AI lo phần boilerplate
- Lặp nhanh: prompt → review → refine

---

## Slide 2: Tech Stack Của Chúng Ta

```
🎨 Frontend:     Angular 17 (Standalone + Signals)
⚙️  Backend:      Express.js + TypeScript
🗄️  Database:     PostgreSQL + Prisma ORM
💳 Payments:     COD + Stripe
🚀 Deploy:       Vercel (cả frontend lẫn backend)
```

---

## Slide 3: Quy Trình Vibe Coding (5 Bước)

```
1. DESIGN  →  Lấy design từ Stitch (screens + HTML code)
2. SCHEMA  →  Mô tả data model → AI viết Prisma schema
3. API     →  Liệt kê endpoints → AI viết Express routes + services
4. UI      →  Dán Stitch HTML → AI convert sang Angular components
5. WIRE    →  AI kết nối API calls + Guards + State management
```

---

## Slide 4: Bước 1 — Lấy Design Từ Stitch

```
1. Truy cập stitch.withgoogle.com
2. Chọn project "Kinetic Marketplace" (ID: 13334482499682641163)
3. Chạy: npx tsx source/stitch/download-stitch.ts
   → Tải 10 màn hình HTML + screenshots
4. Mở stitch/html/*.html trong browser để xem design
5. Copy CSS variables → tailwind.config.js design tokens
```

**Prompt cho Copilot:**
```
"Convert this Stitch HTML into an Angular standalone component,
keeping all the Vietnamese text, using Tailwind CSS with our 
design tokens (primary: #b22203). Add @Input() bindings for 
product data."
```

---

## Slide 5: Bước 2 — Database Schema

**Prompt cho Copilot:**
```
"Create a Prisma schema for a Vietnamese e-commerce app with:
- User (email, fullName, role: CUSTOMER/ADMIN)
- Product (name, slug, price in VND, inventoryCount, imageUrl)
- Category (name, slug, icon)
- Cart + CartItem (server-persisted, 1 per user)
- Order + OrderItem (snapshot pricing)
- Payment (COD or Stripe, status tracking)
Use cuid() for all PKs. PostgreSQL provider."
```

---

## Slide 6: Bước 3 — Backend API

**Prompt cho Copilot:**
```
"Create an Express.js TypeScript route for /api/checkout that:
1. Reads user's cart from DB via Prisma
2. For COD: creates Order (CONFIRMED) + Payment (PAID), clears cart
3. For Stripe: creates Stripe Checkout Session with cart line items,
   creates Order (PENDING), returns sessionUrl
Use authMiddleware to get req.user. Handle errors with next(err)."
```

---

## Slide 7: Bước 4 — Angular Components

**Prompt cho Copilot:**
```
"Create an Angular 17 standalone ProductCardComponent that:
- Accepts @Input() product: Product
- Shows: image, name, price (formatted as VNĐ), badge (% off if originalPrice)
- Has (click) to navigate to /san-pham/:slug
- Has 'Thêm vào giỏ' button calling CartService.addItem()
- Shows loading state during addItem call
- Uses Tailwind CSS with primary color #b22203"
```

---

## Slide 8: Bước 5 — Kết Nối Mọi Thứ

**Prompt cho Copilot:**
```
"Create Angular authGuard and adminGuard functional guards using
inject(AuthService). Create credentialsInterceptor that adds
withCredentials:true to all requests and errorInterceptor that 
redirects to /dang-nhap on 401."
```

---

## Slide 9: Kết Quả

| | Trước Vibe Coding | Sau Vibe Coding |
|---|---|---|
| Thời gian build | 2–4 tuần | 1–2 ngày |
| Chất lượng code | Phụ thuộc experience | Production-ready patterns |
| Design system | Tự thiết kế | Stitch-generated, đồng nhất |
| Boilerplate | Viết tay | AI tự sinh |

---

## Slide 10: Tips & Best Practices

1. **Prompt cụ thể** — Nêu rõ tech stack, pattern, ngôn ngữ UI
2. **Chia nhỏ tasks** — Mỗi prompt 1 component/service/route
3. **Review luôn** — AI có thể sai logic nghiệp vụ, kiểm tra kỹ
4. **Stitch làm nền** — Dùng HTML từ Stitch làm template, Copilot convert
5. **Schema first** — Viết Prisma schema trước, mọi thứ phụ thuộc vào đó
6. **Environment vars** — Không bao giờ hardcode secrets, luôn dùng `.env`
