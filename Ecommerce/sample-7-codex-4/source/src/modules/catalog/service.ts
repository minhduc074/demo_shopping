import { and, asc, count, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, productImages, products, productVariants } from "@/lib/db/schema";

const PAGE_SIZE = 12;

export async function getHomepageData() {
  const [featuredProducts, latestProducts, topCategories] = await Promise.all([
    db.select().from(products).where(and(eq(products.status, "active"), eq(products.isFeatured, true))).orderBy(desc(products.updatedAt)).limit(6),
    db.select().from(products).where(eq(products.status, "active")).orderBy(desc(products.createdAt)).limit(8),
    db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.name)).limit(6),
  ]);

  return { featuredProducts, latestProducts, topCategories };
}

export async function getCatalogData(params: {
  q?: string;
  category?: string;
  sort?: string;
  page?: number;
}) {
  const page = params.page && params.page > 0 ? params.page : 1;
  const conditions = [eq(products.status, "active")];

  if (params.q) {
    conditions.push(
      or(
        ilike(products.name, `%${params.q}%`),
        ilike(products.shortDescription, `%${params.q}%`),
        ilike(products.description, `%${params.q}%`),
      )!,
    );
  }

  if (params.category) {
    const [category] = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, params.category)).limit(1);
    if (category) {
      conditions.push(eq(products.categoryId, category.id));
    }
  }

  const orderBy =
    params.sort === "price-asc"
      ? asc(products.basePrice)
      : params.sort === "price-desc"
        ? desc(products.basePrice)
        : params.sort === "oldest"
          ? asc(products.createdAt)
          : desc(products.createdAt);

  const [items, totalRows, categoryOptions] = await Promise.all([
    db.select().from(products).where(and(...conditions)).orderBy(orderBy).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
    db.select({ value: count() }).from(products).where(and(...conditions)),
    db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.name)),
  ]);

  return {
    items,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total: Number(totalRows[0]?.value ?? 0),
    },
    categories: categoryOptions,
  };
}

export async function getProductBySlug(slug: string) {
  const [product] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);

  if (!product) {
    return null;
  }

  const [images, variants, category] = await Promise.all([
    db.select().from(productImages).where(eq(productImages.productId, product.id)).orderBy(asc(productImages.sortOrder)),
    db.select().from(productVariants).where(and(eq(productVariants.productId, product.id), eq(productVariants.isActive, true))).orderBy(desc(productVariants.isDefault)),
    product.categoryId ? db.select().from(categories).where(eq(categories.id, product.categoryId)).limit(1) : Promise.resolve([]),
  ]);

  const relatedProducts = product.categoryId
    ? await db
        .select()
        .from(products)
        .where(and(eq(products.categoryId, product.categoryId), eq(products.status, "active"), sql`${products.id} <> ${product.id}`))
        .limit(4)
    : [];

  return {
    product,
    images,
    variants,
    category: category[0] ?? null,
    relatedProducts,
  };
}

export async function getProductPricing(productId: string, variantId?: string | null) {
  if (variantId) {
    const [variant] = await db
      .select()
      .from(productVariants)
      .where(and(eq(productVariants.id, variantId), eq(productVariants.productId, productId), eq(productVariants.isActive, true)))
      .limit(1);

    if (variant) {
      return {
        productId,
        variantId: variant.id,
        unitPrice: Number(variant.price),
        variantName: variant.name,
        sku: variant.sku,
        imageUrl: null,
      };
    }
  }

  const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);

  if (!product) {
    return null;
  }

  return {
    productId: product.id,
    variantId: null,
    unitPrice: Number(product.basePrice),
    variantName: null,
    sku: null,
    imageUrl: product.thumbnailUrl,
  };
}

export async function getCategoryMap(ids: string[]) {
  if (!ids.length) {
    return new Map<string, string>();
  }

  const rows = await db.select({ id: categories.id, name: categories.name }).from(categories).where(inArray(categories.id, ids));
  return new Map(rows.map((row) => [row.id, row.name]));
}
