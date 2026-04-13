# Demo — The Editorial Marketplace

## Giới Thiệu

**The Editorial** là ứng dụng thương mại điện tử đầy đủ tính năng với giao diện tiếng Việt, xây dựng bằng Angular 17 + Express.js + PostgreSQL.

---

## Xem Demo

### Yêu Cầu Hệ Thống
- Node.js ≥ 18
- PostgreSQL (hoặc Neon/Supabase free tier)
- Stripe account (để test COD không cần)

---

## Cài Đặt & Chạy

### 1. Backend

```bash
cd source/backend
npm install

# Tạo file .env từ mẫu
cp .env.example .env
# Điền: DATABASE_URL, JWT_SECRET (min 32 ký tự), STRIPE_SECRET_KEY, FRONTEND_URL

# Tạo bảng và dữ liệu mẫu
npx prisma db push
npx tsx prisma/seed.ts

# Chạy dev server
npm run dev
# → http://localhost:3001
```

### 2. Frontend

```bash
cd source/frontend
npm install

# Chạy Angular dev server
npm start
# → http://localhost:4200
```

### 3. Stripe Webhook (tuỳ chọn cho Stripe payments)

```bash
stripe listen --forward-to localhost:3001/api/webhooks/stripe
# Copy "webhook signing secret" vào .env: STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Tài Khoản Demo

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | `admin@editorial.vn` | `Admin@123` |
| Khách hàng | `khach@editorial.vn` | `Khach@123` |

---

## Các Tính Năng Có Thể Demo

| Tính năng | URL | Yêu cầu |
|---|---|---|
| Trang chủ | `/` | — |
| Duyệt sản phẩm + tìm kiếm | `/san-pham` | — |
| Chi tiết sản phẩm | `/san-pham/[slug]` | — |
| Giỏ hàng | `/gio-hang` | Đăng nhập |
| Thanh toán COD | `/thanh-toan` | Đăng nhập |
| Thanh toán Stripe | `/thanh-toan` | Đăng nhập + Stripe key |
| Hồ sơ & lịch sử đơn | `/ho-so` | Đăng nhập |
| Bảng điều khiển admin | `/admin` | Đăng nhập admin |
| Quản lý sản phẩm | `/admin/san-pham` | Đăng nhập admin |

---

## Test Stripe Payment

Dùng thẻ test Stripe:
- **Thành công:** `4242 4242 4242 4242`
- **Từ chối:** `4000 0000 0000 0002`
- CVC: bất kỳ 3 số
- Ngày hết hạn: bất kỳ ngày trong tương lai

---

## Screenshots

> Xem thư mục `images/` sau khi build và chạy ứng dụng.

### Trang Chủ
![Trang Chủ](images/home.png)

### Sản Phẩm
![Danh Sách Sản Phẩm](images/products.png)

### Giỏ Hàng
![Giỏ Hàng](images/cart.png)

### Bảng Điều Khiển Admin
![Admin Dashboard](images/admin.png)

---

## Stitch Design Reference

Giao diện được thiết kế dựa trên Stitch project `13334482499682641163` — "Kinetic Marketplace".

Để tải design assets:
```bash
cd source/stitch
npx tsx download-stitch.ts
# → Tải HTML + screenshots vào stitch/html/ và stitch/screenshots/
```
