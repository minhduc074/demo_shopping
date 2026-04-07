import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-02-25.clover"
});

export function getBaseUrl() {
  return process.env.APP_URL ?? "http://127.0.0.1:3000";
}
