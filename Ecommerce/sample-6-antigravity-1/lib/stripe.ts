import Stripe from "stripe";

import { getStripeSecretKey } from "@/lib/env";

let stripeClient: Stripe | null = null;

export function getStripe() {
  if (!stripeClient) {
    stripeClient = new Stripe(getStripeSecretKey(), {
      // @ts-ignore
      apiVersion: "2023-10-16",
    });
  }

  return stripeClient;
}
