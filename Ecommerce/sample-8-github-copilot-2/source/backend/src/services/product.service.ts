import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

export interface ProductFilters {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "popular" | "price_asc" | "price_desc";
  page?: number;
  limit?: number;
}

export const ProductService = {
  async list(filters: ProductFilters = {}) {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      sort = "newest",
      page = 1,
      limit = 20,
    } = filters;

    const where: Prisma.ProductWhereInput = {
      status: "ACTIVE",
      ...(q && {
        name: { contains: q, mode: "insensitive" as Prisma.QueryMode },
      }),
      ...(category && {
        category: { slug: category },
      }),
      ...(minPrice !== undefined && { price: { gte: minPrice } }),
      ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput = (() => {
      switch (sort) {
        case "popular":
          return { soldCount: "desc" as const };
        case "price_asc":
          return { price: "asc" as const };
        case "price_desc":
          return { price: "desc" as const };
        default:
          return { createdAt: "desc" as const };
      }
    })();

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { category: true },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug, status: "ACTIVE" },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
    });
    if (!product) {
      const err = new Error("Không tìm thấy sản phẩm") as Error & { statusCode: number };
      err.statusCode = 404;
      throw err;
    }
    return product;
  },

  async getRelated(productId: string, categoryId: string, limit = 8) {
    return prisma.product.findMany({
      where: {
        categoryId,
        id: { not: productId },
        status: "ACTIVE",
      },
      take: limit,
      include: { category: true },
      orderBy: { soldCount: "desc" },
    });
  },

  async getFeatured(limit = 10) {
    return prisma.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { soldCount: "desc" },
      take: limit,
      include: { category: true },
    });
  },

  async getFlashSale(limit = 6) {
    return prisma.product.findMany({
      where: {
        status: "ACTIVE",
        originalPrice: { not: null },
      },
      orderBy: [{ soldCount: "desc" }],
      take: limit,
      include: { category: true },
    });
  },
};
