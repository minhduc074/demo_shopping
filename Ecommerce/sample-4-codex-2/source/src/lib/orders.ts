import { prisma } from "@/lib/prisma";

export async function createOrderFromCart({
  userId,
  shippingName,
  shippingEmail,
  addressLine1,
  city,
  country,
  notes,
  stripeCheckoutSessionId,
}: {
  userId: string;
  shippingName: string;
  shippingEmail: string;
  addressLine1: string;
  city: string;
  country: string;
  notes?: string;
  stripeCheckoutSessionId?: string;
}) {
  if (stripeCheckoutSessionId) {
    const existingOrder = await prisma.order.findUnique({
      where: { stripeCheckoutSessionId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (existingOrder) {
      return existingOrder;
    }
  }

  const cart = await prisma.cart.findFirst({
    where: { userId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("Cannot create order from an empty cart.");
  }

  const subtotalCents = cart.items.reduce((sum, item) => sum + item.product.priceCents * item.quantity, 0);
  const shippingCents = 1200;
  const totalCents = subtotalCents + shippingCents;
  const orderCount = await prisma.order.count();

  const order = await prisma.order.create({
    data: {
      userId,
      orderNumber: `TC-2026-${String(orderCount + 1).padStart(5, "0")}`,
      stripeCheckoutSessionId,
      status: "PAID",
      paymentStatus: "PAID",
      subtotalCents,
      shippingCents,
      totalCents,
      shippingName,
      shippingEmail,
      addressLine1,
      city,
      country,
      notes,
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPriceCents: item.product.priceCents,
        })),
      },
    },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  return order;
}

