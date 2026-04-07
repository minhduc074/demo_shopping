import Link from "next/link";
import { redirect } from "next/navigation";
import { getRequiredUser } from "@/lib/auth";
import { createOrderFromCart } from "@/lib/orders";
import { stripe } from "@/lib/stripe";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams.session_id;

  if (!sessionId) {
    redirect("/checkout");
  }

  const user = await getRequiredUser();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    redirect("/checkout");
  }

  const customerName = typeof session.customer_details?.name === "string" ? session.customer_details.name : user.name;
  const customerEmail =
    typeof session.customer_details?.email === "string" ? session.customer_details.email : user.email;

  const line1 = session.customer_details?.address?.line1 ?? "Stripe Checkout";
  const city = session.customer_details?.address?.city ?? "Unknown";
  const country = session.customer_details?.address?.country ?? "Unknown";

  const order = await createOrderFromCart({
    userId: user.id,
    shippingName: customerName,
    shippingEmail: customerEmail,
    addressLine1: line1,
    city,
    country,
    notes: `Stripe Checkout Session ${session.id}`,
    stripeCheckoutSessionId: session.id,
  });

  return (
    <div className="content-shell">
      <div className="mx-auto max-w-2xl rounded-[2rem] bg-white p-10 shadow-[0_16px_40px_rgba(45,47,47,0.06)]">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[--primary]">Payment successful</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.03em] text-[--ink]">Order {order.orderNumber} confirmed</h1>
        <p className="mt-4 text-sm leading-6 text-[--muted]">Stripe payment was captured successfully. The cart was cleared after the order was created.</p>
        <div className="mt-8 flex gap-4">
          <Link className="signature-button" href="/orders">
            View orders
          </Link>
          <Link className="rounded-full bg-[--surface-low] px-5 py-3 text-sm font-semibold text-[--ink]" href="/">
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
