import { redirect } from "next/navigation";
import { CheckoutButton } from "@/components/store/checkout-button";
import { SiteHeader } from "@/components/store/site-header";
import { requireSignedInProfile } from "@/lib/auth";
import { getCartForUser } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const profile = await requireSignedInProfile();
  const cart = await getCartForUser(profile.id);
  if (cart.items.length === 0) {
    redirect("/cart");
  }

  return (
    <div className="pb-20">
      <SiteHeader />
      <main className="section-shell pt-8">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-secondary)]">Checkout</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em]">Order review.</h1>
        </div>
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          <section className="surface-panel space-y-5">
            <div className="grid gap-3">
              {cart.items.map((item) => (
                <div className="flex items-center justify-between rounded-[0.9rem] bg-[var(--color-surface-low)] px-4 py-3" key={item.id}>
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-[var(--color-text-muted)]">Qty {item.quantity}</p>
                  </div>
                  <p className="font-semibold">{formatCurrency(item.lineTotal)}</p>
                </div>
              ))}
            </div>
          </section>
          <aside className="surface-panel h-fit space-y-5">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-secondary)]">Totals</p>
              <h2 className="mt-2 text-2xl font-semibold">{formatCurrency(cart.totalAmount)}</h2>
            </div>
            <CheckoutButton />
          </aside>
        </div>
      </main>
    </div>
  );
}
