import { SiteHeader } from "@/components/store/site-header";
import { requireAdminProfile } from "@/lib/auth";
import { getAdminSummary, listRecentOrdersForAdmin } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdminProfile();
  const summary = await getAdminSummary();
  const recentOrders = await listRecentOrdersForAdmin();

  return (
    <div className="pb-20">
      <SiteHeader />
      <main className="section-shell pt-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-secondary)]">Management</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.04em]">Dashboard.</h1>
          </div>
          <Link className="rounded-[0.75rem] bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white" href="/admin/products">
            Manage Products
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <div className="surface-panel">
            <p className="text-sm text-[var(--color-text-muted)]">Gross Revenue</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(summary.revenue)}</p>
          </div>
          <div className="surface-panel">
            <p className="text-sm text-[var(--color-text-muted)]">Paid Orders</p>
            <p className="mt-2 text-2xl font-semibold">{summary.paidOrders}</p>
          </div>
          <div className="surface-panel">
            <p className="text-sm text-[var(--color-text-muted)]">Active Products</p>
            <p className="mt-2 text-2xl font-semibold">{summary.activeProducts}</p>
          </div>
          <div className="surface-panel">
            <p className="text-sm text-[var(--color-text-muted)]">Low Stock Alerts</p>
            <p className="mt-2 text-2xl font-semibold text-red-600">{summary.lowStockProducts}</p>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-semibold">Recent Orders</h2>
          <div className="surface-panel overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--color-surface-low)]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Order</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-surface-high)]">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 font-medium">{order.orderNumber}</td>
                    <td className="px-6 py-4">{order.user.email}</td>
                    <td className="px-6 py-4 text-[var(--color-text-muted)]">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-[var(--color-surface-high)] px-2 py-1 text-xs">{order.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">{formatCurrency(Number(order.totalAmount))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
