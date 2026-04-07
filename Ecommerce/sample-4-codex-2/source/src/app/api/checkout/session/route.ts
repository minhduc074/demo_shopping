import { NextResponse } from "next/server";
import { getRequiredUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const user = await getRequiredUser();

  const cart = await prisma.cart.findFirst({
    where: { userId: user.id },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ message: "Cart is empty." }, { status: 400 });
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    billing_address_collection: "required",
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout?canceled=1`,
    metadata: {
      userId: user.id,
      cartId: cart.id,
    },
    line_items: cart.items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "usd",
        unit_amount: item.product.priceCents,
        product_data: {
          name: item.product.name,
          description: item.product.description.slice(0, 240),
          images: item.product.imageUrl.startsWith("http") ? [item.product.imageUrl] : undefined,
          metadata: {
            productId: item.productId,
          },
        },
      },
    })),
  });

  return NextResponse.json({ url: session.url });
}
