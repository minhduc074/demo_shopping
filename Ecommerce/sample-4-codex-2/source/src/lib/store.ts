import { cache } from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const getFeaturedCategories = cache(async () =>
  prisma.category.findMany({
    where: { featured: true },
    orderBy: { name: "asc" },
    take: 5,
  }),
);

export const getFeaturedProducts = cache(async () =>
  prisma.product.findMany({
    where: { featured: true, status: "ACTIVE" },
    include: { category: true },
    orderBy: [{ reviewCount: "desc" }, { createdAt: "desc" }],
    take: 6,
  }),
);

export const getNewArrivals = cache(async () =>
  prisma.product.findMany({
    where: { status: "ACTIVE" },
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 4,
  }),
);

export const getProductBySlug = cache(async (slug: string) =>
  prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  }),
);

export async function getRelatedProducts(categoryId: string, productId: string) {
  return prisma.product.findMany({
    where: {
      categoryId,
      id: { not: productId },
      status: "ACTIVE",
    },
    include: { category: true },
    orderBy: { reviewCount: "desc" },
    take: 4,
  });
}

export async function searchProducts(params: { query?: string; category?: string; page?: number; pageSize?: number }) {
  const query = params.query?.trim();
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.max(1, Math.min(params.pageSize ?? 24, 60));
  const where = {
    status: "ACTIVE" as const,
    ...(params.category ? { category: { slug: params.category } } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" as const } },
            { brand: { contains: query, mode: "insensitive" as const } },
            { description: { contains: query, mode: "insensitive" as const } },
            { tags: { has: query.toLowerCase() } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: [{ featured: "desc" }, { reviewCount: "desc" }, { id: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  };
}

export const getAllCategories = cache(async () =>
  prisma.category.findMany({
    orderBy: { name: "asc" },
  }),
);

export async function getCart() {
  return prisma.cart.findFirst({
    where: {
      userId: (await getCurrentUser())?.id,
    },
    include: {
      user: true,
      items: {
        include: {
          product: {
            include: { category: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function getOrders() {
  return prisma.order.findMany({
    where: {
      userId: (await getCurrentUser())?.id,
    },
    include: {
      items: {
        include: { product: true },
      },
      user: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getDashboardData() {
  const [products, orders, categories, lowStock] = await Promise.all([
    prisma.product.count(),
    prisma.order.findMany({
      include: {
        user: true,
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.count(),
    prisma.product.findMany({
      where: {
        inventory: { lte: 10 },
        status: "ACTIVE",
      },
      include: { category: true },
      orderBy: { inventory: "asc" },
      take: 5,
    }),
  ]);

  return {
    stats: {
      productCount: products,
      orderCount: orders.length,
      categoryCount: categories,
      revenueCents: orders.reduce((sum, order) => sum + order.totalCents, 0),
    },
    recentOrders: orders.slice(0, 5),
    lowStock,
  };
}

export const getProductManagementData = cache(async () =>
  prisma.product.findMany({
    include: { category: true },
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
  }),
);

export async function getCheckoutData() {
  const user = await getCurrentUser();
  const [cart, recommendations] = await Promise.all([
    prisma.cart.findFirst({
      where: { userId: user?.id },
      include: {
        user: true,
        items: {
          include: {
            product: {
              include: { category: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    prisma.product.findMany({
      where: { featured: true, status: "ACTIVE" },
      include: { category: true },
      orderBy: { reviewCount: "desc" },
      take: 3,
    }),
  ]);

  return { cart, recommendations };
}
