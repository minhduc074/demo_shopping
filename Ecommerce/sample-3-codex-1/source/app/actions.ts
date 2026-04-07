"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getOrCreateCart } from "@/lib/cart";
import { getCartSummary } from "@/lib/catalog";
import { getBaseUrl, stripe } from "@/lib/stripe";

export async function addToCartAction(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const size = String(formData.get("size") ?? "M");
  const color = String(formData.get("color") ?? "Mặc định");

  if (!productId) {
    redirect("/products");
  }

  const cart = await getOrCreateCart();

  const existing = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
      size,
      color
    }
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: { increment: 1 } }
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        size,
        color,
        quantity: 1
      }
    });
  }

  revalidatePath("/cart");
  revalidatePath("/checkout");
  redirect("/cart");
}

export async function updateCartItemQuantityAction(formData: FormData) {
  const itemId = String(formData.get("itemId") ?? "");
  const nextQuantity = Number(formData.get("quantity") ?? 1);

  if (!itemId) return;

  if (nextQuantity <= 0) {
    await prisma.cartItem.delete({
      where: { id: itemId }
    });
  } else {
    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: nextQuantity }
    });
  }

  revalidatePath("/cart");
  revalidatePath("/checkout");
}

export async function createStripeCheckoutSessionAction() {
  const cart = await getOrCreateCart();
  const summary = await getCartSummary();

  if (!summary.items.length) {
    redirect("/cart");
  }

  const baseUrl = getBaseUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/checkout`,
    line_items: summary.items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "vnd",
        unit_amount: item.product.price,
        product_data: {
          name: item.product.name,
          description: item.product.description,
          images: [item.product.image]
        }
      }
    })),
    metadata: {
      cartId: cart.id,
      cartToken: cart.token
    }
  });

  if (!session.url) {
    redirect("/checkout");
  }

  redirect(session.url);
}
