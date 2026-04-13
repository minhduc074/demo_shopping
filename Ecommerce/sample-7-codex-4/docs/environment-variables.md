# Environment Variables

## Required

- `DATABASE_URL`
  - Kết nối PostgreSQL chính.
- `SESSION_SECRET`
  - Secret ký session cookie, tối thiểu 32 ký tự.
- `APP_URL`
  - Base URL để sinh link reset password.

## Optional but needed for forgot password

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

## Optional but needed for Stripe

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## Example

```env
APP_URL=http://localhost:3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/editorial_commerce
SESSION_SECRET=replace-with-a-long-random-secret
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@example.com
SMTP_PASS=super-secret
SMTP_FROM="The Editorial <no-reply@example.com>"
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```
