# Database Integration Assumptions

## Mục tiêu

Ứng dụng này chỉ đọc/ghi PostgreSQL thật. Không có fallback in-memory.

## Bảng giả định

- `users`
- `sessions`
- `password_reset_tokens`
- `categories`
- `products`
- `product_images`
- `product_variants`
- `carts`
- `cart_items`
- `addresses`
- `shipping_methods`
- `orders`
- `order_items`

## Assumption quan trọng

- `users.role` dùng `user | admin`
- `products.status` dùng `active | draft | archived`
- `orders.status` dùng `pending | confirmed | packing | shipping | completed | cancelled`
- `orders.payment_status` dùng `pending | paid | failed | refunded`
- `product_variants` có thể rỗng; app vẫn hoạt động với base product
- `shipping_methods` phải có ít nhất 1 record để checkout thành công

## Khi schema thực tế khác assumption

- Chạy `pnpm db:check`
- Sửa mapping tại:
  - `source/src/lib/db/schema.ts`
  - `source/src/lib/db/assumptions.ts`
  - service tương ứng trong `source/src/modules/*/service.ts`

## Không che giấu thiếu schema

- Nếu bảng/cột không tồn tại, app sẽ lỗi rõ thay vì trả dữ liệu giả.
- Các empty state hiện tại chỉ dùng cho trường hợp dữ liệu thật đang rỗng.
