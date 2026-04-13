import { asc, count, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, orders, products } from "@/lib/db/schema";
import { productUpsertSchema } from "@/modules/admin/schemas";

export async function getAdminDashboardData() {
  const [recentOrders, recentProducts, totalOrdersRows, totalProductsRows] = await Promise.all([
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(8),
    db.select().from(products).orderBy(desc(products.updatedAt)).limit(6),
    db.select({ value: count() }).from(orders),
    db.select({ value: count() }).from(products),
  ]);

  const revenueRows = await db.select({ value: orders.total }).from(orders).where(eq(orders.paymentStatus, "paid"));
  const revenue = revenueRows.reduce((acc, row) => acc + Number(row.value), 0);

  return {
      recentOrders,
      recentProducts,
      stats: {
      totalOrders: Number(totalOrdersRows[0]?.value ?? 0),
      totalProducts: Number(totalProductsRows[0]?.value ?? 0),
      revenue,
    },
  };
}

export async function getAdminProducts() {
  return db.select().from(products).orderBy(desc(products.updatedAt));
}

export async function getProductFormData(productId?: string) {
  const categoryOptions = await db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.name));
  if (!productId) {
    return { product: null, categoryOptions };
  }

  const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  return { product: product ?? null, categoryOptions };
}

export async function upsertProduct(input: unknown) {
  const data = productUpsertSchema.parse(input);

  if (data.id) {
    await db
      .update(products)
      .set({
        name: data.name,
        slug: data.slug,
        categoryId: data.categoryId ?? null,
        shortDescription: data.shortDescription || null,
        description: data.description || null,
        brand: data.brand || null,
        status: data.status,
        basePrice: data.basePrice.toString(),
        compareAtPrice: data.compareAtPrice ? data.compareAtPrice.toString() : null,
        currency: data.currency,
        thumbnailUrl: data.thumbnailUrl || null,
        isFeatured: data.isFeatured,
        updatedAt: new Date(),
      })
      .where(eq(products.id, data.id));

    return data.id;
  }

  const [created] = await db
    .insert(products)
    .values({
      name: data.name,
      slug: data.slug,
      categoryId: data.categoryId ?? null,
      shortDescription: data.shortDescription || null,
      description: data.description || null,
      brand: data.brand || null,
      status: data.status,
      basePrice: data.basePrice.toString(),
      compareAtPrice: data.compareAtPrice ? data.compareAtPrice.toString() : null,
      currency: data.currency,
      thumbnailUrl: data.thumbnailUrl || null,
      isFeatured: data.isFeatured,
    })
    .returning({ id: products.id });

  return created.id;
}

export async function deleteProduct(productId: string) {
  await db.delete(products).where(eq(products.id, productId));
}
