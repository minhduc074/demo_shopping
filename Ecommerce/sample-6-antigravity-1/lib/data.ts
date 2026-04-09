import { InventoryStatus, OrderStatus, PaymentStatus, Prisma, ProductStatus } from "@prisma/client";

import type {
  AdminSummaryDto,
  CartDto,
  CategoryDto,
  OrderDto,
  ProductCard,
  ProductDetail,
  ProductSearchResponse,
} from "@/lib/contracts";
import { prisma } from "@/lib/prisma";
import { createOrderNumber } from "@/lib/utils";

function toNumber(value: Prisma.Decimal | number | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }
  return Number(value);
}

function inventoryLabel(status: InventoryStatus, count: number) {
  if (status === InventoryStatus.OUT_OF_STOCK || count <= 0) {
    return "Out of stock";
  }
  if (status === InventoryStatus.LOW_STOCK || count <= 10) {
    return `${count} left`;
  }
  return "In stock";
}

function mapProductCard(product: {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  price: Prisma.Decimal;
  compareAtPrice: Prisma.Decimal | null;
  inventoryStatus: InventoryStatus;
  inventoryCount: number;
  category: { name: string };
  images: Array<{ url: string }>;
}): ProductCard {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    category: product.category.name,
    price: toNumber(product.price) ?? 0,
    compareAtPrice: toNumber(product.compareAtPrice),
    imageUrl: product.images[0]?.url ?? "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
    inventoryLabel: inventoryLabel(product.inventoryStatus, product.inventoryCount),
  };
}

export async function listCategories(): Promise<CategoryDto[]> {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    icon: category.icon,
  }));
}

export async function listProducts(params?: {
  query?: string;
  category?: string;
  featured?: boolean;
  limit?: number;
}): Promise<ProductCard[]> {
  const products = await prisma.product.findMany({
    where: {
      status: ProductStatus.ACTIVE,
      featured: params?.featured ? true : undefined,
      category: params?.category
        ? {
            slug: params.category,
          }
        : undefined,
      OR: params?.query
        ? [
            { name: { contains: params.query, mode: "insensitive" } },
            { shortDescription: { contains: params.query, mode: "insensitive" } },
            { description: { contains: params.query, mode: "insensitive" } },
          ]
        : undefined,
    },
    include: {
      category: true,
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: params?.limit,
  });

  return products.map(mapProductCard);
}

export async function searchProducts(params?: {
  query?: string;
  category?: string;
  offset?: number;
  limit?: number;
}): Promise<ProductSearchResponse> {
  const take = params?.limit ?? 24;
  const skip = params?.offset ?? 0;

  const where: Prisma.ProductWhereInput = {
    status: ProductStatus.ACTIVE,
    category: params?.category
      ? {
          slug: params.category,
        }
      : undefined,
    OR: params?.query
      ? [
          { name: { contains: params.query, mode: "insensitive" } },
          { shortDescription: { contains: params.query, mode: "insensitive" } },
          { description: { contains: params.query, mode: "insensitive" } },
        ]
      : undefined,
  };

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }, { id: "asc" }],
      skip,
      take,
    }),
  ]);

  const items = products.map(mapProductCard);
  const nextOffset = skip + items.length < total ? skip + items.length : null;

  return {
    items,
    total,
    nextOffset,
    hasMore: nextOffset !== null,
  };
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!product) {
    return null;
  }

  const card = mapProductCard(product);
  return {
    ...card,
    description: product.description,
    gallery: product.images.map((image) => image.url),
  };
}

export async function getOrCreateCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function getCartForUser(userId: string): Promise<CartDto> {
  const cart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: {
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const subtotal = cart.items.reduce(
    (sum, item) => sum + (toNumber(item.product.price) ?? 0) * item.quantity,
    0,
  );
  const taxAmount = subtotal * 0.08;
  const totalAmount = subtotal + taxAmount;

  return {
    id: cart.id,
    itemCount: cart.items.reduce((count, item) => count + item.quantity, 0),
    subtotal,
    taxAmount,
    totalAmount,
    items: cart.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productSlug: item.product.slug,
      productName: item.product.name,
      imageUrl:
        item.product.images[0]?.url ??
        "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
      quantity: item.quantity,
      unitPrice: toNumber(item.product.price) ?? 0,
      lineTotal: (toNumber(item.product.price) ?? 0) * item.quantity,
      inventoryLabel: inventoryLabel(item.product.inventoryStatus, item.product.inventoryCount),
    })),
  };
}

export async function addCartItem(userId: string, productId: string, quantity: number) {
  const cart = await getOrCreateCart(userId);

  await prisma.cartItem.upsert({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
    update: {
      quantity: {
        increment: quantity,
      },
    },
    create: {
      cartId: cart.id,
      productId,
      quantity,
    },
  });

  return getCartForUser(userId);
}

export async function updateCartItem(userId: string, itemId: string, quantity: number) {
  const cart = await getOrCreateCart(userId);
  const item = await prisma.cartItem.findFirst({
    where: {
      id: itemId,
      cartId: cart.id,
    },
  });

  if (!item) {
    throw new Error("Cart item not found");
  }

  if (quantity === 0) {
    await prisma.cartItem.delete({
      where: { id: itemId },
    });
  } else {
    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  return getCartForUser(userId);
}

export async function listOrdersForUser(userId: string): Promise<OrderDto[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    totalAmount: toNumber(order.totalAmount) ?? 0,
    paymentStatus: order.payment?.status ?? PaymentStatus.PENDING,
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      productSlug: item.productSlug,
      quantity: item.quantity,
      totalPrice: toNumber(item.totalPrice) ?? 0,
    })),
  }));
}

export async function getAdminSummary(): Promise<AdminSummaryDto> {
  const [orders, activeProducts, lowStockProducts] = await Promise.all([
    prisma.order.findMany({
      where: { status: "PAID" },
      select: { totalAmount: true },
    }),
    prisma.product.count({
      where: { status: ProductStatus.ACTIVE },
    }),
    prisma.product.count({
      where: {
        OR: [
          { inventoryStatus: InventoryStatus.LOW_STOCK },
          { inventoryStatus: InventoryStatus.OUT_OF_STOCK },
          { inventoryCount: { lte: 10 } },
        ],
      },
    }),
  ]);

  return {
    revenue: orders.reduce((sum, order) => sum + (toNumber(order.totalAmount) ?? 0), 0),
    paidOrders: orders.length,
    activeProducts,
    lowStockProducts,
  };
}

export async function listAdminProducts() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    categoryId: product.categoryId,
    categoryName: product.category.name,
    shortDescription: product.shortDescription,
    description: product.description,
    price: toNumber(product.price) ?? 0,
    compareAtPrice: toNumber(product.compareAtPrice),
    inventoryCount: product.inventoryCount,
    featured: product.featured,
    imageUrl:
      product.images[0]?.url ??
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
  }));
}

export async function listRecentOrdersForAdmin() {
  return prisma.order.findMany({
    take: 5,
    include: {
      user: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createOrderFromCart(input: {
  userId: string;
  stripeCheckoutSessionId: string;
}) {
  const cart = await getCartForUser(input.userId);
  if (cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  return prisma.order.create({
    data: {
      userId: input.userId,
      orderNumber: createOrderNumber(),
      status: "PENDING",
      subtotal: cart.subtotal,
      taxAmount: cart.taxAmount,
      totalAmount: cart.totalAmount,
      stripeCheckoutSessionId: input.stripeCheckoutSessionId,
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          productSlug: item.productSlug,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.lineTotal,
        })),
      },
      payment: {
        create: {
          amount: cart.totalAmount,
          status: "PENDING",
          stripeCheckoutSessionId: input.stripeCheckoutSessionId,
        },
      },
    },
    include: {
      items: true,
      payment: true,
    },
  });
}

export async function finalizeOrderPaymentByCheckoutSessionId(
  stripeCheckoutSessionId: string,
  stripePaymentIntentId?: string | null,
) {
  const order = await prisma.order.findUnique({
    where: { stripeCheckoutSessionId },
    include: {
      items: true,
      payment: true,
      user: {
        include: {
          cart: true,
        },
      },
    },
  });

  if (!order) {
    return { finalized: false, reason: "ORDER_NOT_FOUND" as const };
  }

  if (order.payment?.status === PaymentStatus.SUCCEEDED || order.status === OrderStatus.PAID) {
    return { finalized: false, reason: "ALREADY_FINALIZED" as const, orderId: order.id };
  }

  await prisma.$transaction(async (tx) => {
    if (order.payment) {
      await tx.payment.update({
        where: { orderId: order.id },
        data: {
          status: PaymentStatus.SUCCEEDED,
          stripePaymentIntentId: stripePaymentIntentId ?? undefined,
        },
      });
    }

    await tx.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.PAID },
    });

    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          inventoryCount: {
            decrement: item.quantity,
          },
        },
      });
    }

    if (order.user.cart) {
      await tx.cartItem.deleteMany({
        where: { cartId: order.user.cart.id },
      });
    }
  });

  return { finalized: true, reason: null, orderId: order.id };
}
