// src/lib/db/products.ts
// Server-side data fetching for products using direct Postgres access

import { Pool } from "pg";

const globalForDb = globalThis as unknown as { dbPool?: Pool };

const pgUrl = (process.env.POSTGRES_URL_NON_POOLING ?? "").replace(
  "sslmode=require",
  "sslmode=no-verify"
);

const pool =
  globalForDb.dbPool ??
  new Pool({
    connectionString: pgUrl,
    ssl: { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.dbPool = pool;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price: number | null;
  discount_percent: number | null;
  image_url: string;
  category: string | null;
  sold_count: number;
  stock: number;
  is_flash_sale: boolean;
  is_mall: boolean;
  rating: number;
  review_count: number;
  is_new: boolean;
  created_at: string;
}

function mapRow(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    name: String(row.name),
    description: String(row.description ?? ""),
    price: Number(row.price),
    original_price: row.original_price === null ? null : Number(row.original_price),
    discount_percent: row.discount_percent === null ? null : Number(row.discount_percent),
    image_url: String(row.image_url ?? ""),
    category: row.category === null ? null : String(row.category),
    sold_count: Number(row.sold_count ?? 0),
    stock: Number(row.stock ?? 0),
    is_flash_sale: Boolean(row.is_flash_sale),
    is_mall: Boolean(row.is_mall),
    rating: Number(row.rating ?? 0),
    review_count: Number(row.review_count ?? 0),
    is_new: Boolean(row.is_new),
    created_at: String(row.created_at),
  };
}

export async function getFlashSaleProducts(limit = 6): Promise<Product[]> {
  try {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM products
      WHERE is_flash_sale = true
      ORDER BY sold_count DESC
      LIMIT $1
      `,
      [limit]
    );
    return rows.map(mapRow);
  } catch (error) {
    console.error("getFlashSaleProducts error:", error);
    return [];
  }
}

export async function getDailyProducts(
  limit = 12,
  page = 0
): Promise<Product[]> {
  const offset = Math.max(0, page) * limit;
  try {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM products
      WHERE is_flash_sale = false
      ORDER BY sold_count DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );
    return rows.map(mapRow);
  } catch (error) {
    console.error("getDailyProducts error:", error);
    return [];
  }
}

export async function getProductsByCategory(
  category: string,
  limit = 12,
  page = 0
): Promise<Product[]> {
  const offset = Math.max(0, page) * limit;
  try {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM products
      WHERE category = $1
      ORDER BY sold_count DESC
      LIMIT $2 OFFSET $3
      `,
      [category, limit, offset]
    );
    return rows.map(mapRow);
  } catch (error) {
    console.error("getProductsByCategory error:", error);
    return [];
  }
}

export async function searchProducts(
  query: string,
  limit = 24
): Promise<Product[]> {
  try {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM products
      WHERE name ILIKE $1
      ORDER BY sold_count DESC
      LIMIT $2
      `,
      [`%${query}%`, limit]
    );
    return rows.map(mapRow);
  } catch (error) {
    console.error("searchProducts error:", error);
    return [];
  }
}
