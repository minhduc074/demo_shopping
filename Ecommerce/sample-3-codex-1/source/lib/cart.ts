import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export const CART_COOKIE = "song_hong_cart";

export async function getCartToken() {
  const cookieStore = await cookies();
  return cookieStore.get(CART_COOKIE)?.value ?? null;
}

export async function getOrCreateCart() {
  const cookieStore = await cookies();
  let token = cookieStore.get(CART_COOKIE)?.value;

  if (!token) {
    token = randomUUID();
    cookieStore.set(CART_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    });
  }

  return prisma.cart.upsert({
    where: { token },
    update: {},
    create: { token }
  });
}

export async function getCurrentCart() {
  const token = await getCartToken();
  if (!token) return null;

  return prisma.cart.findUnique({
    where: { token },
    include: {
      items: {
        include: { product: true },
        orderBy: { createdAt: "asc" }
      }
    }
  });
}

export async function clearCurrentCart() {
  const cart = await getCurrentCart();
  if (!cart) return;

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id }
  });
}
