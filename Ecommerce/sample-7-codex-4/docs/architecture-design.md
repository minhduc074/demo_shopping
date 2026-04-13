# Architecture Design

## Chọn công nghệ

- Next.js 16 App Router:
  - Một codebase cho frontend và backend.
  - Route handlers, server components, server actions phù hợp production web app.
- React 19:
  - Mô hình server/client mới, ít state client hơn.
- Drizzle ORM + PostgreSQL:
  - Stable, type-safe, dễ ánh xạ schema hiện hữu.
- Zod:
  - Validate chặt input từ form và action.
- Tailwind CSS 4:
  - Áp token từ Stitch nhanh, dễ maintain.

## Cấu trúc source

- `src/app`: route, page, layout, server actions
- `src/components`: component UI/layout/form tái sử dụng
- `src/lib`: env, db, auth, util, constants
- `src/modules`: business logic theo domain

## Layers

- Controller:
  - App Router pages
  - Route handler `/api/health/db`
  - Server actions trong `src/app/actions.ts`
- Service:
  - `src/modules/*/service.ts`
- Repository / query:
  - Truy vấn Drizzle trực tiếp trong service theo module
- Infrastructure:
  - `src/lib/db/*`
  - `src/lib/auth/*`
  - `src/lib/mail.ts`

## Security

- Password hash bằng bcrypt.
- Session lưu DB trong bảng `sessions`.
- Cookie HTTP-only, SameSite Lax.
- Route admin có double guard:
  - `proxy.ts` chặn anonymous.
  - `requireAdmin()` kiểm tra role.

## Checkout Transaction

1. Đọc cart hiện tại.
2. Validate shipping method và payment method.
3. Tạo record `orders`.
4. Tạo `order_items`.
5. Lưu snapshot địa chỉ vào `addresses`.
6. Xóa `cart_items`.

## Stripe Flow

1. User chọn `paymentMethod = stripe`.
2. Server tạo `orders` và `order_items` ở trạng thái `pending`.
3. Server tạo Stripe Checkout Session với `metadata.orderId`.
4. User thanh toán trên trang Stripe.
5. Webhook `checkout.session.completed` xác thực chữ ký rồi cập nhật `orders.payment_status = paid`.

## Failure Strategy

- Không fallback sang mock.
- Nếu DB schema sai hoặc thiếu dữ liệu, UI hiển thị empty/error state rõ ràng.
- `pnpm db:check` để phát hiện mismatch với schema assumption.
