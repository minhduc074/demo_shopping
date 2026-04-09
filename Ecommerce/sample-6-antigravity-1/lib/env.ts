function required(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function getStripePublishableKey() {
  return required("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
}

export function getStripeSecretKey() {
  return required("STRIPE_SECRET_KEY");
}

export function getStripeWebhookSecret() {
  return required("STRIPE_WEBHOOK_SECRET");
}
