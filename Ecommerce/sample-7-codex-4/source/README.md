# The Editorial Commerce

Next.js App Router full-stack commerce starter bám theo Stitch project `13334482499682641163`.

## Stack

- Frontend + backend: Next.js 16, React 19, TypeScript
- Query layer: Drizzle ORM + PostgreSQL (`pg`)
- Validation: Zod
- Forms: Server Actions + client form wrappers
- Auth: database-backed session cookie, bcrypt password hash
- Payments: Stripe Checkout + signed webhook
- Styling: Tailwind CSS 4 + design tokens từ Stitch

## Chạy từ đầu sau khi clone

### 1. Cài dependencies

```bash
cd source
pnpm install
```

### 2. Tạo file môi trường

Repo đã có mẫu `.env.example`.

```bash
cp .env.example .env.local
```

Cập nhật tối thiểu:

- `DATABASE_URL`
- `SESSION_SECRET`

Nếu dùng Stripe, điền:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

Nếu dùng quên mật khẩu qua email, điền SMTP:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

### 3. Tạo database và đẩy schema

Nếu PostgreSQL đã chạy và `DATABASE_URL` trỏ đúng database:

```bash
pnpm db:push
```

Kiểm tra schema:

```bash
pnpm db:check
```

### 4. Seed dữ liệu catalog lớn

Để có khoảng 10.000 sản phẩm mẫu phục vụ test listing, search, pagination và admin:

```bash
pnpm db:seed:products
```

Script này sẽ:

- tạo 10 danh mục nếu chưa có
- tạo đủ tới 10.000 sản phẩm
- tạo 10.000 ảnh sản phẩm
- tạo 10.000 biến thể mặc định

Nếu chạy lại, script sẽ không tăng quá 10.000 sản phẩm.

### 5. Chạy local

```bash
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000).

### 6. Build production

```bash
pnpm build
pnpm start
```

## Stripe local webhook

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Lấy `whsec_...` do Stripe CLI cấp và cập nhật vào `.env.local`.

## Scripts

- `pnpm dev`
- `pnpm build`
- `pnpm start`
- `pnpm lint`
- `pnpm db:generate`
- `pnpm db:push`
- `pnpm db:check`
- `pnpm db:seed:products`

## Notes

- Ứng dụng không dùng mock business data.
- Nếu schema thực tế khác assumption, chạy `pnpm db:check` để xem bảng/cột còn thiếu.
- `pnpm db:push` sẽ tạo bảng theo schema Drizzle hiện tại trong database đang cấu hình.
- Stripe Checkout chỉ xác nhận thanh toán qua webhook đã ký.
