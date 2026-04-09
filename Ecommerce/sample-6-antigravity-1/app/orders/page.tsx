import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/store/site-header";
import { requireSignedInProfile } from "@/lib/auth";
import { listOrdersForUser } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const profile = await requireSignedInProfile();
  const orders = await listOrdersForUser(profile.id);

  return (
    <div className="pb-20">
      <SiteHeader />
      <main className="section-shell pt-8">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-secondary)]">History</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em]">Your Orders.</h1>
        </div>
        
        <div className="space-y-6">
          {orders.map((order) => (
            <div className="surface-panel" key={order.id}>
              <div className="mb-4 flex flex-wrap items-center justify-between border-b pb-4">
                <div>
                  <p className="font-semibold">Order {order.orderNumber}</p>
                  <p className="text-sm text-[var(--color-text-muted)]">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(order.totalAmount)}</p>
                  <span className="rounded-full bg-[var(--color-surface-low)] px-3 py-1 text-xs font-semibold">{order.status}</span>
                </div>
              </div>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div className="flex justify-between text-sm" key={item.id}>
                    <p>{item.quantity}x {item.productName}</p>
                    <p>{formatCurrency(item.totalPrice)}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="text-[var(--color-text-muted)]">You don't have any orders yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}
