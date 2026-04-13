import { prisma } from "../lib/prisma";
import { CartService } from "./cart.service";
import Stripe from "stripe";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { apiVersion: "2023-10-16" });
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ED-${timestamp}-${random}`;
}

export interface CheckoutInput {
  paymentMethod: "COD" | "STRIPE";
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  city: string;
  note?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export const OrderService = {
  async getOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getOrderById(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: true,
        payment: true,
      },
    });
    if (!order) {
      const err = new Error("Không tìm thấy đơn hàng") as Error & { statusCode: number };
      err.statusCode = 404;
      throw err;
    }
    return order;
  },

  async checkout(userId: string, input: CheckoutInput) {
    // Load and validate cart
    const cart = await CartService.getOrCreateCart(userId);
    if (!cart.items.length) {
      const err = new Error("Giỏ hàng trống") as Error & { statusCode: number };
      err.statusCode = 400;
      throw err;
    }

    // Validate stock for all items
    for (const item of cart.items) {
      if (item.product.inventoryCount < item.quantity) {
        const err = new Error(
          `Sản phẩm "${item.product.name}" chỉ còn ${item.product.inventoryCount} trong kho`
        ) as Error & { statusCode: number };
        err.statusCode = 400;
        throw err;
      }
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const shippingFee = subtotal >= 500000 ? 0 : 30000;
    const totalAmount = subtotal + shippingFee;

    const orderItems = cart.items.map((item) => ({
      productId: item.productId,
      productName: item.product.name,
      productImage: item.product.imageUrl,
      unitPrice: item.product.price,
      quantity: item.quantity,
      totalPrice: item.product.price * item.quantity,
    }));

    if (input.paymentMethod === "COD") {
      // Create confirmed order immediately
      const order = await prisma.order.create({
        data: {
          userId,
          orderNumber: generateOrderNumber(),
          status: "CONFIRMED",
          paymentMethod: "COD",
          recipientName: input.recipientName,
          recipientPhone: input.recipientPhone,
          shippingAddress: input.shippingAddress,
          city: input.city,
          note: input.note,
          subtotal,
          shippingFee,
          totalAmount,
          items: { create: orderItems },
          payment: {
            create: {
              method: "COD",
              status: "PENDING",
              paidAt: null,
            },
          },
        },
        include: { items: true, payment: true },
      });

      // Decrement inventory and increment sold count
      await updateInventory(cart.items);
      await CartService.clearCart(userId);

      return { type: "cod" as const, orderId: order.id, orderNumber: order.orderNumber };
    } else {
      // Stripe checkout
      const stripe = getStripe();
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:4200";
      const successUrl = input.successUrl || `${frontendUrl}/don-hang-thanh-cong?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = input.cancelUrl || `${frontendUrl}/gio-hang`;

      // Create pending order first
      const order = await prisma.order.create({
        data: {
          userId,
          orderNumber: generateOrderNumber(),
          status: "PENDING",
          paymentMethod: "STRIPE",
          recipientName: input.recipientName,
          recipientPhone: input.recipientPhone,
          shippingAddress: input.shippingAddress,
          city: input.city,
          note: input.note,
          subtotal,
          shippingFee,
          totalAmount,
          items: { create: orderItems },
          payment: {
            create: { method: "STRIPE", status: "PENDING" },
          },
        },
      });

      // Create Stripe session
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cart.items.map((item) => ({
        price_data: {
          currency: "vnd",
          product_data: {
            name: item.product.name,
            ...(item.product.imageUrl && { images: [item.product.imageUrl] }),
          },
          unit_amount: item.product.price,
        },
        quantity: item.quantity,
      }));

      if (shippingFee > 0) {
        lineItems.push({
          price_data: {
            currency: "vnd",
            product_data: { name: "Phí vận chuyển" },
            unit_amount: shippingFee,
          },
          quantity: 1,
        });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { orderId: order.id },
      });

      // Store session ID in order
      await prisma.order.update({
        where: { id: order.id },
        data: {
          stripeSessionId: session.id,
          payment: { update: { stripeSessionId: session.id } },
        },
      });

      return { type: "stripe" as const, sessionUrl: session.url!, orderId: order.id };
    }
  },

  async handleStripeWebhook(payload: Buffer, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");

    const stripe = getStripe();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch {
      const err = new Error("Webhook signature verification failed") as Error & { statusCode: number };
      err.statusCode = 400;
      throw err;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      if (!orderId) return;

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
      if (!order) return;

      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "CONFIRMED",
          payment: {
            update: {
              status: "PAID",
              stripePaymentIntentId: session.payment_intent as string,
              paidAt: new Date(),
            },
          },
        },
      });

      await updateInventory(order.items as Array<{ productId: string; quantity: number }>);
      await CartService.clearCart(order.userId);
    } else if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      if (!orderId) return;

      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
          payment: { update: { status: "FAILED" } },
        },
      });
    }
  },

  // Admin: get all orders
  async getAllOrders(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        include: { user: { select: { email: true, fullName: true } }, items: true, payment: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count(),
    ]);
    return { orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },

  async updateOrderStatus(orderId: string, status: string) {
    const validStatuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      const err = new Error("Trạng thái đơn hàng không hợp lệ") as Error & { statusCode: number };
      err.statusCode = 400;
      throw err;
    }
    return prisma.order.update({
      where: { id: orderId },
      data: { status: status as "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" },
    });
  },
};

async function updateInventory(items: Array<{ productId: string; quantity: number }>) {
  for (const item of items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        inventoryCount: { decrement: item.quantity },
        soldCount: { increment: item.quantity },
      },
    });
  }
}
