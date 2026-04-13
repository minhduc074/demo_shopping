# API Overview

## Route Handlers

- `GET /api/health/db`
  - Kiểm tra kết nối DB.
- `POST /api/stripe/webhook`
  - Nhận sự kiện `checkout.session.completed` từ Stripe.

## Server Actions

- `registerAction`
- `loginAction`
- `logoutAction`
- `forgotPasswordAction`
- `resetPasswordAction`
- `addToCartAction`
- `updateCartItemAction`
- `removeCartItemAction`
- `checkoutAction`
  - Nếu `paymentMethod = stripe`, tạo Stripe Checkout Session và redirect.
- `updateProfileAction`
- `upsertProductAction`
- `deleteProductAction`
- `updateOrderStatusAction`

## Kiểu giao tiếp

- UI forms gửi `FormData` vào server action.
- Validation chạy bằng Zod trong layer service.
- Mutation xong sẽ `revalidatePath()` hoặc `redirect()`.
