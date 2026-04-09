import { redirect } from "next/navigation";
import { CartPanel } from "@/components/store/cart-panel";
import { SiteHeader } from "@/components/store/site-header";
import { getCurrentUserProfile } from "@/lib/auth";
import { getCartForUser } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const profile = await getCurrentUserProfile();
  if (!profile) redirect("/login");

  const cart = await getCartForUser(profile.id);

  return (
    <div className="pb-20">
      <SiteHeader />
      <main className="section-shell pt-8">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-secondary)]">Your Basket</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em]">Review line items.</h1>
        </div>
        <CartPanel initialCart={cart} />
      </main>
    </div>
  );
}
