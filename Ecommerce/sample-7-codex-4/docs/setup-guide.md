# Setup Guide

## 1. Chuẩn bị

- Node.js 23+
- pnpm 10+
- PostgreSQL đang chạy

## 2. Cấu hình

1. Vào `source/`
2. Tạo `.env.local` từ `.env.example`
3. Điền `DATABASE_URL`
4. Điền `SESSION_SECRET`
5. Nếu dùng quên mật khẩu, điền SMTP
6. Nếu dùng Stripe, điền 3 biến Stripe

## 3. Kiểm tra schema

```bash
cd source
pnpm install
pnpm db:check
```

Nếu command báo thiếu bảng/cột, đối chiếu `docs/database-integration-assumptions.md`.

## 4. Chạy local

```bash
cd source
pnpm dev
```

Mở `http://localhost:3000`.

## Stripe webhook local

Ví dụ với Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Lấy secret `whsec_...` từ CLI và đặt vào `STRIPE_WEBHOOK_SECRET`.

## 5. Build production

```bash
cd source
pnpm build
pnpm start
```
