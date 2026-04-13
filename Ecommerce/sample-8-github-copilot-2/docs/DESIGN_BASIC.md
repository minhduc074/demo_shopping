# Thiết Kế Cơ Bản — The Editorial Marketplace

## 1. Tổng Quan Dự Án

**The Editorial** là nền tảng thương mại điện tử hiện đại dành cho thị trường Việt Nam, mang phong cách editorial cao cấp với trải nghiệm mua sắm mượt mà. Toàn bộ giao diện và nội dung bằng tiếng Việt.

**Slogan:** _Nâng tầm phong cách cá nhân_

---

## 2. Tech Stack

| Lớp | Công nghệ |
|---|---|
| Frontend | Angular 17 (Standalone Components, Signals, Lazy Routes) |
| Backend | Node.js + Express.js (TypeScript), triển khai Vercel Serverless |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (httpOnly cookie, 7 ngày) + bcrypt |
| Thanh toán | COD (Thanh toán khi nhận hàng) + Stripe Checkout |
| Style | Tailwind CSS v3 + Design System riêng |
| Fonts | Be Vietnam Pro (heading) + Inter (body) |
| Icons | Material Symbols (Rounded) |

---

## 3. Hệ Thống Màu Sắc (Design System — Kinetic Marketplace)

| Token | Giá trị | Mô tả |
|---|---|---|
| `primary` | `#b22203` | Màu chính (đỏ editorial) |
| `primary-container` | `#ff775b` | Nền nút nhấn nhẹ |
| `secondary` | `#a03740` | Accent phụ |
| `tertiary` | `#7f3f9f` | Màu badge/tag |
| `surface` | `#f6f6f6` | Nền trang |
| `surface-low` | `#f0f1f1` | Nền card/section |
| `surface-lowest` | `#ffffff` | Nền trắng |
| `ink` | `#2d2f2f` | Màu chữ chính |
| `muted` | `#6b7280` | Chữ phụ |

**Quy tắc:** không dùng đường viền 1px cứng — thay bằng tonal layering. Nav dùng glassmorphism (`backdrop-blur: 24px`, 70% opacity).

---

## 4. Danh Mục Sản Phẩm

| Danh mục | Icon |
|---|---|
| Thời Trang | checkroom |
| Điện Tử | devices |
| Làm Đẹp | auto_fix_high |
| Nhà Cửa | home |
| Thể Thao | fitness_center |
| Sách | menu_book |

---

## 5. Màn Hình Chính (10 Screens)

### 5.1 Trang Chủ — `/`
- Header glassmorphism với logo, tìm kiếm, giỏ hàng, user menu
- Hero banner full-width với CTA "Khám phá ngay"
- Flash sale bar với countdown timer
- Grid danh mục ngang (icons + tên)
- Section "Gợi Ý Hôm Nay": tab Mới nhất / Bán chạy, lưới sản phẩm
- Footer với newsletter, links hỗ trợ

### 5.2 Tìm Kiếm & Danh Mục — `/san-pham`
- Thanh tìm kiếm nổi bật phía trên
- Sidebar lọc: danh mục, khoảng giá, rating, trạng thái tồn kho
- Grid sản phẩm (3–4 cột trên desktop, 2 cột trên mobile)
- Sort: Mới nhất / Bán chạy / Giá tăng / Giá giảm
- Pagination
- Empty state khi không tìm thấy

### 5.3 Chi Tiết Sản Phẩm — `/san-pham/:slug`
- Gallery ảnh (thumbnail + ảnh lớn)
- Tên, giá (cũ/mới), badge giảm giá
- Bộ chọn số lượng
- Nút "Thêm vào giỏ" + "Mua ngay"
- Tab: Mô tả / Thông số / Đánh giá
- Section sản phẩm liên quan

### 5.4 Giỏ Hàng — `/gio-hang`
- Danh sách sản phẩm với ảnh, tên, giá, bộ chọn số lượng, nút xóa
- Subtotal + Tổng tiền
- CTA "Tiến hành thanh toán"
- Empty state khi giỏ trống

### 5.5 Thanh Toán — `/thanh-toan`
- Form địa chỉ giao hàng (họ tên, số điện thoại, địa chỉ, tỉnh/thành)
- Chọn phương thức thanh toán: COD / Stripe
- Tóm tắt đơn hàng
- Nút "Đặt hàng" (COD) hoặc "Thanh toán bằng thẻ" (Stripe)

### 5.6 Đăng Nhập — `/dang-nhap`
- Split layout: ảnh editorial trái, form phải
- Form: Email/SĐT + Mật khẩu
- Link "Quên mật khẩu" (UI only)
- Social login buttons (Google / Facebook — UI only, not functional)
- Link đến trang đăng ký

### 5.7 Đăng Ký — `/dang-ky`
- Form: Họ tên, Email, Số điện thoại, Mật khẩu, Xác nhận mật khẩu
- Validation realtime
- Checkbox chấp nhận điều khoản
- Link trở về đăng nhập

### 5.8 Hồ Sơ & Đơn Hàng — `/ho-so` (yêu cầu đăng nhập)
- Tab: Hồ sơ / Đơn hàng
- Form chỉnh sửa thông tin cá nhân
- Danh sách đơn hàng với trạng thái, ngày tạo
- Chi tiết đơn hàng (expand)

### 5.9 Bảng Điều Khiển Admin — `/admin` (yêu cầu ADMIN)
- KPI cards: Doanh thu hôm nay / Đơn hàng chờ / Sản phẩm active / Người dùng
- Biểu đồ doanh thu (bar chart tuần)
- Bảng đơn hàng gần đây
- Quick actions: Thêm sản phẩm, Xem báo cáo

### 5.10 Quản Lý Sản Phẩm Admin — `/admin/san-pham`
- Bảng danh sách sản phẩm (có ảnh, tên, giá, trạng thái, tồn kho)
- Nút thêm mới, chỉnh sửa, xóa
- Modal CRUD: tên, mô tả, giá, ảnh URL, danh mục, trạng thái, tồn kho

---

## 6. Luồng Người Dùng

### 6.1 Khách Hàng (Shopper)
```
Trang chủ → Danh mục / Tìm kiếm → Chi tiết sản phẩm
    → Thêm vào giỏ → Giỏ hàng → Đăng nhập/Đăng ký
    → Thanh toán (COD hoặc Stripe) → Xác nhận đơn hàng
    → Hồ sơ / Lịch sử đơn hàng
```

### 6.2 Quản Trị Viên (Admin)
```
Đăng nhập (role ADMIN) → Bảng điều khiển
    → Quản lý sản phẩm (CRUD) → Quản lý đơn hàng (cập nhật trạng thái)
    → Quản lý người dùng (xem danh sách)
```

---

## 7. Trạng Thái UI

Mỗi màn hình phải xử lý:
- **Loading**: skeleton loader hoặc spinner
- **Empty**: minh hoạ + thông báo rõ ràng + CTA gợi ý
- **Error**: thông báo lỗi + nút thử lại
- **Success**: toast notification + redirect phù hợp

---

## 8. Responsive Design

| Breakpoint | Layout |
|---|---|
| `< 640px` (mobile) | Sidebar ẩn, grid 1–2 cột, bottom nav |
| `640px–1024px` (tablet) | Grid 2–3 cột |
| `≥ 1024px` (desktop) | Sidebar cố định, grid 4 cột |
