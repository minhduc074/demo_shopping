import Stripe from "stripe";
import { env } from "@/lib/env";

let stripeClient: Stripe | null = null;

export function getStripe() {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("Thiếu STRIPE_SECRET_KEY. Hãy cấu hình Stripe trong .env.local.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
      appInfo: {
        name: "The Editorial Commerce",
      },
    });
  }

  return stripeClient;
}
