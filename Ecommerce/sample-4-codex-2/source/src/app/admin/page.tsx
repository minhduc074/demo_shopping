import { OrderCard, PageIntro, StatCard } from "@/components/commerce";
import { getDashboardData } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

export default async function AdminPage() {
  const dashboard = await getDashboardData();

  return (
    <div className="content-shell space-y-10">
      <PageIntro description="A Stitch-inspired operations view with real counts, live order relations, and low-stock signals from PostgreSQL." eyebrow="Admin Dashboard" title="Marketplace control room" />
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard hint="Active catalog size" label="Products" value={String(dashboard.stats.productCount)} />
        <StatCard hint="Persisted orders" label="Orders" value={String(dashboard.stats.orderCount)} />
        <StatCard hint="Merchandising buckets" label="Categories" value={String(dashboard.stats.categoryCount)} />
        <StatCard hint="Revenue seeded in the demo DB" label="Revenue" value={formatCurrency(dashboard.stats.revenueCents)} />
      </section>
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {dashboard.recentOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
        <div className="rounded-[1.75rem] bg-white p-6 shadow-[0_16px_40px_rgba(45,47,47,0.06)]">
          <h2 className="text-xl font-bold text-[--ink]">Low stock watch</h2>
          <div className="mt-5 space-y-4">
            {dashboard.lowStock.map((product) => (
              <div className="flex items-center justify-between border-b border-black/5 pb-4 last:border-b-0 last:pb-0" key={product.id}>
                <div>
                  <p className="font-semibold text-[--ink]">{product.name}</p>
                  <p className="text-sm text-[--muted]">{product.category.name}</p>
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                  {product.inventory} left
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

