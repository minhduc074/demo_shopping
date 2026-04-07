import Image from "next/image";
import Link from "next/link";
import { PageIntro, ProductCard, SectionHeading } from "@/components/commerce";
import { CheckoutButton } from "@/components/forms";
import { getCheckoutData } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

export default async function CheckoutPage() {
  const { cart, recommendations } = await getCheckoutData();
  const subtotal = cart?.items.reduce((sum, item) => sum + item.quantity * item.product.priceCents, 0) ?? 0;
  const shipping = 1200;
  const total = subtotal + shipping;

  return (
    <div className="content-shell space-y-10">
      <PageIntro description="The checkout screen summarizes the persisted cart and is ready for payment integration." eyebrow="Checkout" title="Complete the order" />
      {!cart || cart.items.length === 0 ? (
        <div className="rounded-[1.75rem] bg-white p-10 text-center shadow-[0_16px_40px_rgba(45,47,47,0.06)]">
          <h2 className="text-2xl font-bold text-[--ink]">No items available for checkout</h2>
          <p className="mt-3 text-sm text-[--muted]">Add products to the cart first. Successful Stripe payments clear the cart automatically.</p>
          <Link className="signature-button mt-6" href="/search">
            Go to search
          </Link>
        </div>
      ) : null}
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[1.75rem] bg-white p-6 shadow-[0_16px_40px_rgba(45,47,47,0.06)]">
          <h2 className="text-xl font-bold text-[--ink]">Shipping details</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input className="rounded-2xl bg-[--surface-low] px-4 py-3 outline-none" defaultValue={cart?.user?.name ?? ""} placeholder="Full name" />
            <input className="rounded-2xl bg-[--surface-low] px-4 py-3 outline-none" defaultValue={cart?.user?.email ?? ""} placeholder="Email" />
            <input className="rounded-2xl bg-[--surface-low] px-4 py-3 outline-none md:col-span-2" defaultValue="42 Nguyen Hue" placeholder="Address line 1" />
            <input className="rounded-2xl bg-[--surface-low] px-4 py-3 outline-none" defaultValue="Ho Chi Minh City" placeholder="City" />
            <input className="rounded-2xl bg-[--surface-low] px-4 py-3 outline-none" defaultValue="Vietnam" placeholder="Country" />
          </div>
        </section>

        <aside className="rounded-[1.75rem] bg-white p-6 shadow-[0_16px_40px_rgba(45,47,47,0.06)]">
          <h2 className="text-xl font-bold text-[--ink]">Order summary</h2>
          <div className="mt-5 space-y-4">
            {cart?.items.map((item) => (
              <div className="flex items-center gap-3" key={item.id}>
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-[--surface-low]">
                  <Image alt={item.product.name} className="object-cover" fill src={item.product.imageUrl} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[--ink]">{item.product.name}</p>
                  <p className="text-sm text-[--muted]">Qty {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-[--ink]">{formatCurrency(item.product.priceCents * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-3 border-t border-black/5 pt-4 text-sm">
            <div className="flex justify-between text-[--muted]"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between text-[--muted]"><span>Shipping</span><span>{formatCurrency(shipping)}</span></div>
            <div className="flex justify-between text-lg font-bold text-[--ink]"><span>Total</span><span>{formatCurrency(total)}</span></div>
          </div>
          <CheckoutButton />
        </aside>
      </div>

      <section>
        <SectionHeading copy="Cross-sell cards sourced from featured products." title="You might also like" />
        <div className="grid gap-6 md:grid-cols-3">
          {recommendations.map((product) => (
            <ProductCard compact key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
