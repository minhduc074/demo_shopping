import { NextResponse } from "next/server";
import { getCurrentUserProfile } from "@/lib/auth";
import { getCartForUser, createOrderFromCart } from "@/lib/data";
import { getStripe } from "@/lib/stripe";
import { getBaseUrl } from "@/lib/env";

export async function POST() {
  const profile = await getCurrentUserProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cart = await getCartForUser(profile.id);
  if (cart.items.length === 0) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: profile.email,
    client_reference_id: profile.id,
    line_items: cart.items.map((item) => ({
      price_data: {
        currency: "usd",
        unit_amount: Math.round(item.unitPrice * 100),
        product_data: {
          name: item.productName,
          images: [item.imageUrl],
        },
      },
      quantity: item.quantity,
    })),
    success_url: `${getBaseUrl()}/orders?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getBaseUrl()}/cart`,
  });

  if (!session.url || !session.id) {
    return NextResponse.json({ error: "Failed to create Stripe session" }, { status: 500 });
  }

  await createOrderFromCart({
    userId: profile.id,
    stripeCheckoutSessionId: session.id,
  });

  return NextResponse.json({ sessionId: session.id, url: session.url });
}
