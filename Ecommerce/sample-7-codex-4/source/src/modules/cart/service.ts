import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { cartItems, carts, products, productVariants } from "@/lib/db/schema";
import { AppError } from "@/lib/errors";
import { getOrCreateCartSessionKey } from "@/lib/auth/cart-session";
import { getProductPricing } from "@/modules/catalog/service";
import { addToCartSchema, removeCartItemSchema, updateCartItemSchema } from "@/modules/cart/schemas";

async function getOrCreateActiveCart(userId?: string | null) {
  const sessionKey = userId ? null : await getOrCreateCartSessionKey();
  const existing = await db
    .select()
    .from(carts)
    .where(
      userId
        ? and(eq(carts.userId, userId), eq(carts.status, "active"))
        : and(eq(carts.sessionKey, sessionKey!), eq(carts.status, "active")),
    )
    .limit(1);

  if (existing[0]) {
    return existing[0];
  }

  const [created] = await db
    .insert(carts)
    .values({
      userId: userId ?? null,
      sessionKey,
    })
    .returning();

  return created;
}

export async function getCart(userId?: string | null) {
  const sessionKey = userId ? null : await getOrCreateCartSessionKey();
  const [cart] = await db
    .select()
    .from(carts)
    .where(
      userId
        ? and(eq(carts.userId, userId), eq(carts.status, "active"))
        : and(eq(carts.sessionKey, sessionKey!), eq(carts.status, "active")),
    )
    .limit(1);

  if (!cart) {
    return { cart: null, items: [], summary: { subtotal: 0, quantity: 0 } };
  }

  const items = await db
    .select({
      id: cartItems.id,
      cartId: cartItems.cartId,
      productId: cartItems.productId,
      variantId: cartItems.variantId,
      quantity: cartItems.quantity,
      unitPrice: cartItems.unitPrice,
      productName: products.name,
      productSlug: products.slug,
      productThumbnail: products.thumbnailUrl,
      variantName: productVariants.name,
    })
    .from(cartItems)
    .innerJoin(products, eq(products.id, cartItems.productId))
    .leftJoin(productVariants, eq(productVariants.id, cartItems.variantId))
    .where(eq(cartItems.cartId, cart.id));

  const summary = items.reduce(
    (acc, item) => {
      acc.quantity += item.quantity;
      acc.subtotal += Number(item.unitPrice) * item.quantity;
      return acc;
    },
    { subtotal: 0, quantity: 0 },
  );

  return { cart, items, summary };
}

export async function addToCart(userId: string | null, input: unknown) {
  const data = addToCartSchema.parse(input);
  const pricing = await getProductPricing(data.productId, data.variantId);

  if (!pricing) {
    throw new AppError("Không tìm thấy sản phẩm hoặc biến thể.", 404);
  }

  const cart = await getOrCreateActiveCart(userId);
  const [existing] = await db
    .select()
    .from(cartItems)
    .where(
      and(
        eq(cartItems.cartId, cart.id),
        eq(cartItems.productId, data.productId),
        data.variantId ? eq(cartItems.variantId, data.variantId) : isNull(cartItems.variantId),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .update(cartItems)
      .set({
        quantity: existing.quantity + data.quantity,
        updatedAt: new Date(),
      })
      .where(eq(cartItems.id, existing.id));
    return;
  }

  await db.insert(cartItems).values({
    cartId: cart.id,
    productId: data.productId,
    variantId: data.variantId ?? null,
    quantity: data.quantity,
    unitPrice: pricing.unitPrice.toString(),
  });
}

export async function updateCartItem(input: unknown) {
  const data = updateCartItemSchema.parse(input);
  await db
    .update(cartItems)
    .set({
      quantity: data.quantity,
      updatedAt: new Date(),
    })
    .where(eq(cartItems.id, data.itemId));
}

export async function removeCartItem(input: unknown) {
  const data = removeCartItemSchema.parse(input);
  await db.delete(cartItems).where(eq(cartItems.id, data.itemId));
}

export async function attachCartToUser(userId: string) {
  const sessionKey = await getOrCreateCartSessionKey();
  await db.update(carts).set({ userId, sessionKey: null, updatedAt: new Date() }).where(and(eq(carts.sessionKey, sessionKey), eq(carts.status, "active")));
}
