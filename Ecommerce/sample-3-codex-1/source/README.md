# Song Hong Core

Next.js App Router storefront recreated from the Stitch project `Modern E-commerce UI` with TypeScript on both frontend and backend, plus Prisma configured for PostgreSQL.

## Stack

- Next.js App Router
- TypeScript
- Prisma ORM
- PostgreSQL

## Routes

- `/` home
- `/products` product listing
- `/products/[slug]` product detail
- `/cart` cart
- `/checkout` checkout
- `/account` profile
- `/api/products` backend JSON endpoint

## Database setup

1. Create a PostgreSQL database.
2. Add `.env` with:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/song_hong_core?schema=public"
```

3. Generate Prisma client and seed data:

```bash
npm run prisma:generate
npx prisma db push
npm run prisma:seed
```

## Development

```bash
npm run dev
```

If PostgreSQL is not available yet, the UI still renders using demo data from `data/demo-data.ts`.

## Stitch references

Downloaded Stitch references live in `stitch-assets/`.
