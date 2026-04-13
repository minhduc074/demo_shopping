# Very Detailed Design

## Token Mapping

- Background: `#f6f6f6`
- Surface thấp: `#f0f1f1`
- Surface trung bình: `#e7e8e8`
- Surface cao: `#dbdddd`
- Foreground: `#2d2f2f`
- Primary: `#b22203`
- Primary soft: `#ff775b`
- Secondary: `#006665`
- Tertiary accent: `#fcb800`
- Danger: `#b41340`

## Typography

- Heading: `Be Vietnam Pro`, weight 600-700
- Body và label: `Inter`, weight 400-600
- Hero title desktop: 56px-64px
- Section title: 30px-36px
- Product card title: 20px-24px
- Metadata: 12px uppercase tracking rộng

## Spacing

- Max width: `1440px`
- Global horizontal padding: `16 / 24 / 32px`
- Card radius: `12px` tới `28px`
- CTA radius: pill
- Vertical rhythm section: `48px - 56px`

## Component Notes

- Product card:
  - Ảnh 4:5
  - Brand nhỏ ở trên
  - Tên sản phẩm headline
  - Giá dưới cùng
- Auth panel:
  - Split layout desktop
  - Bên trái là brand narrative
  - Bên phải là form thật
- Admin:
  - Không dùng dashboard card mosaic quá dày
  - Ưu tiên số liệu lớn, danh sách gần đây, form CRUD rõ ràng

## Responsive Behavior

- Mobile:
  - Hero stack dọc
  - Grid 1 cột hoặc 2 cột
  - Sidebar account/admin chuyển thành cột trên
- Desktop:
  - Hero split
  - Product listing 4 cột
  - Checkout 2 cột
