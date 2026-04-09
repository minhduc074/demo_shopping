import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getStripeWebhookSecret } from "@/lib/env";
import { finalizeOrderPaymentByCheckoutSessionId } from "@/lib/data";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") as string;
  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, getStripeWebhookSecret());
  } catch (err: any) {
    console.error(`Webhook signature verification failed.`, err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    try {
      await finalizeOrderPaymentByCheckoutSessionId(
        session.id,
        typeof session.payment_intent === "string" ? session.payment_intent : null,
      );
    } catch (e: any) {
      console.error(e);
      return new NextResponse(`Order Finalization Error: ${e.message}`, { status: 500 });
    }
  }

  return new NextResponse("OK", { status: 200 });
}
