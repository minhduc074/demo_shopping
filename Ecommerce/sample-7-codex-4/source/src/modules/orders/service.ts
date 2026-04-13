import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { addresses, cartItems, carts, orderItems, orders, shippingMethods } from "@/lib/db/schema";
import { AppError } from "@/lib/errors";
import { absoluteUrl } from "@/lib/utils";
import { getStripe } from "@/lib/stripe";
import { getCart } from "@/modules/cart/service";
import { checkoutSchema } from "@/modules/orders/schemas";

function generateOrderNumber() {
  return `ED-${Date.now().toString().slice(-8)}`;
}

export async function getShippingMethods() {
  return db.select().from(shippingMethods).where(eq(shippingMethods.isActive, true)).orderBy(shippingMethods.fee);
}

export async function createOrderFromCart(userId: string, input: unknown) {
  const data = checkoutSchema.parse(input);
  const cartBundle = await getCart(userId);

  if (!cartBundle.cart || cartBundle.items.length === 0) {
    throw new AppError("Giỏ hàng đang trống.", 400);
  }

  const [shippingMethod] = await db.select().from(shippingMethods).where(eq(shippingMethods.id, data.shippingMethodId)).limit(1);

  if (!shippingMethod) {
    throw new AppError("Phương thức vận chuyển không hợp lệ.", 400);
  }

  const subtotal = cartBundle.items.reduce((acc, item) => acc + Number(item.unitPrice) * item.quantity, 0);
  const shippingFee = Number(shippingMethod.fee);
  const total = subtotal + shippingFee;

  const orderId = await db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orders)
      .values({
        orderNumber: generateOrderNumber(),
        userId,
        status: "pending",
        paymentStatus: "pending",
        paymentMethod: data.paymentMethod,
        shippingMethodId: data.shippingMethodId,
        shippingName: data.fullName,
        shippingPhone: data.phone,
        shippingLine1: data.line1,
        shippingLine2: data.line2 || null,
        shippingWard: data.ward || null,
        shippingDistrict: data.district || null,
        shippingProvince: data.province,
        shippingPostalCode: data.postalCode || null,
        subtotal: subtotal.toString(),
        shippingFee: shippingFee.toString(),
        discountAmount: "0",
        total: total.toString(),
        note: data.note || null,
      })
      .returning({ id: orders.id });

    await tx.insert(orderItems).values(
      cartBundle.items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        variantName: item.variantName || null,
        sku: null,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice).toString(),
        lineTotal: (Number(item.unitPrice) * item.quantity).toString(),
        productImageUrl: item.productThumbnail,
      })),
    );

    await tx.insert(addresses).values({
      userId,
      fullName: data.fullName,
      phone: data.phone,
      line1: data.line1,
      line2: data.line2 || null,
      ward: data.ward || null,
      district: data.district || null,
      province: data.province,
      postalCode: data.postalCode || null,
      isDefault: false,
    });

    await tx.delete(cartItems).where(eq(cartItems.cartId, cartBundle.cart!.id));
    await tx.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, cartBundle.cart!.id));

    return order.id;
  });

  return orderId;
}

async function buildOrderDraft(userId: string, input: unknown) {
  const data = checkoutSchema.parse(input);
  const cartBundle = await getCart(userId);

  if (!cartBundle.cart || cartBundle.items.length === 0) {
    throw new AppError("Giỏ hàng đang trống.", 400);
  }

  const [shippingMethod] = await db.select().from(shippingMethods).where(eq(shippingMethods.id, data.shippingMethodId)).limit(1);

  if (!shippingMethod) {
    throw new AppError("Phương thức vận chuyển không hợp lệ.", 400);
  }

  const subtotal = cartBundle.items.reduce((acc, item) => acc + Number(item.unitPrice) * item.quantity, 0);
  const shippingFee = Number(shippingMethod.fee);

  return {
    data,
    cartBundle,
    shippingMethod,
    subtotal,
    total: subtotal + shippingFee,
    shippingFee,
  };
}

export async function createStripeCheckoutFromCart(userId: string, input: unknown) {
  const draft = await buildOrderDraft(userId, input);
  const stripe = getStripe();

  const orderId = await db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orders)
      .values({
        orderNumber: generateOrderNumber(),
        userId,
        status: "pending",
        paymentStatus: "pending",
        paymentMethod: "stripe",
        shippingMethodId: draft.data.shippingMethodId,
        shippingName: draft.data.fullName,
        shippingPhone: draft.data.phone,
        shippingLine1: draft.data.line1,
        shippingLine2: draft.data.line2 || null,
        shippingWard: draft.data.ward || null,
        shippingDistrict: draft.data.district || null,
        shippingProvince: draft.data.province,
        shippingPostalCode: draft.data.postalCode || null,
        subtotal: draft.subtotal.toString(),
        shippingFee: draft.shippingFee.toString(),
        discountAmount: "0",
        total: draft.total.toString(),
        note: draft.data.note || null,
      })
      .returning({ id: orders.id });

    await tx.insert(orderItems).values(
      draft.cartBundle.items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        variantName: item.variantName || null,
        sku: null,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice).toString(),
        lineTotal: (Number(item.unitPrice) * item.quantity).toString(),
        productImageUrl: item.productThumbnail,
      })),
    );

    return order.id;
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: absoluteUrl(`/thanh-toan/thanh-cong?orderId=${orderId}&session_id={CHECKOUT_SESSION_ID}`),
    cancel_url: absoluteUrl(`/thanh-toan/huy?orderId=${orderId}`),
    client_reference_id: orderId,
    metadata: {
      orderId,
      userId,
    },
    line_items: [
      ...draft.cartBundle.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "vnd",
          unit_amount: Math.round(Number(item.unitPrice)),
          product_data: {
            name: item.productName,
            description: item.variantName || undefined,
            images: item.productThumbnail ? [item.productThumbnail] : undefined,
          },
        },
      })),
      {
        quantity: 1,
        price_data: {
          currency: "vnd",
          unit_amount: Math.round(draft.shippingFee),
          product_data: {
            name: `Phí vận chuyển - ${draft.shippingMethod.name}`,
          },
        },
      },
    ],
  });

  if (!session.url) {
    throw new AppError("Không thể tạo phiên thanh toán Stripe.", 500);
  }

  return {
    orderId,
    url: session.url,
  };
}

export async function markStripeOrderPaid(orderId: string) {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) {
    throw new AppError("Không tìm thấy đơn hàng Stripe.", 404);
  }

  if (order.paymentStatus === "paid") {
    return;
  }

  const cartRows = await db
    .select()
    .from(carts)
    .where(and(eq(carts.userId, order.userId), eq(carts.status, "active")))
    .limit(1);

  await db.transaction(async (tx) => {
    await tx
      .update(orders)
      .set({
        paymentStatus: "paid",
        status: order.status === "pending" ? "confirmed" : order.status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    await tx.insert(addresses).values({
      userId: order.userId,
      fullName: order.shippingName,
      phone: order.shippingPhone,
      line1: order.shippingLine1,
      line2: order.shippingLine2 || null,
      ward: order.shippingWard || null,
      district: order.shippingDistrict || null,
      province: order.shippingProvince,
      postalCode: order.shippingPostalCode || null,
      isDefault: false,
    });

    if (cartRows[0]) {
      await tx.delete(cartItems).where(eq(cartItems.cartId, cartRows[0].id));
      await tx.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, cartRows[0].id));
    }
  });
}

export async function getOrdersForAdmin(params: { q?: string; status?: string }) {
  const conditions = [];

  if (params.status) {
    conditions.push(eq(orders.status, params.status));
  }

  if (params.q) {
    conditions.push(sql`${orders.orderNumber} ilike ${`%${params.q}%`}`);
  }

  return db.select().from(orders).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(orders.createdAt));
}

export async function getOrderForAdmin(orderId: string) {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) {
    return null;
  }

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return { order, items };
}

export async function updateOrderStatus(orderId: string, status: string) {
  await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, orderId));
}
