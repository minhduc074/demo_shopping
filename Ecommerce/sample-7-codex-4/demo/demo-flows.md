# Demo Flows

## Luồng người dùng

1. Vào `/`, xem hero và danh mục nổi bật lấy từ `categories` và `products`.
2. Truy cập `/san-pham`, tìm kiếm, lọc danh mục, sắp xếp và phân trang.
3. Mở `/san-pham/[slug]`, chọn biến thể nếu có và thêm vào giỏ.
4. Vào `/gio-hang`, cập nhật số lượng hoặc xóa dòng hàng.
5. Đăng nhập hoặc đăng ký.
6. Vào `/thanh-toan`, chọn vận chuyển, chọn thanh toán và tạo đơn.
7. Vào `/tai-khoan/don-hang`, kiểm tra trạng thái và chi tiết đơn.

## Luồng quản trị

1. Đăng nhập bằng tài khoản có `role = 'admin'`.
2. Vào `/admin` để xem overview.
3. Vào `/admin/san-pham` để thêm/sửa/xóa sản phẩm.
4. Vào `/admin/don-hang` để lọc đơn.
5. Mở `/admin/don-hang/[id]` và cập nhật trạng thái.

## Kiểm thử nhanh

- `GET /api/health/db` để xác nhận DB kết nối.
- `pnpm db:check` để kiểm tra assumption schema.
