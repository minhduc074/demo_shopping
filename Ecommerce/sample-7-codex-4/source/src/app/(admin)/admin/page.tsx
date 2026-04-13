import { SectionTitle, StatusBadge } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { getAdminDashboardData } from "@/modules/admin/service";

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData();

  return (
    <div className="space-y-8">
      <SectionTitle title="Bảng điều khiển Admin" description="Số liệu lấy trực tiếp từ bảng orders và products." />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] bg-white p-5 shadow-[var(--shadow-ambient)]"><p className="text-sm text-[var(--muted)]">Doanh thu đã thanh toán</p><p className="mt-3 font-display text-3xl font-semibold">{formatCurrency(data.stats.revenue)}</p></div>
        <div className="rounded-[24px] bg-white p-5 shadow-[var(--shadow-ambient)]"><p className="text-sm text-[var(--muted)]">Tổng đơn hàng</p><p className="mt-3 font-display text-3xl font-semibold">{data.stats.totalOrders}</p></div>
        <div className="rounded-[24px] bg-white p-5 shadow-[var(--shadow-ambient)]"><p className="text-sm text-[var(--muted)]">Tổng sản phẩm</p><p className="mt-3 font-display text-3xl font-semibold">{data.stats.totalProducts}</p></div>
      </div>
      <div className="grid gap-8 xl:grid-cols-2">
        <div className="rounded-[28px] bg-white p-6 shadow-[var(--shadow-ambient)]">
          <h2 className="font-display text-2xl font-semibold">Đơn hàng mới nhất</h2>
          <div className="mt-4 space-y-3">
            {data.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-2xl bg-[var(--surface-low)] p-4">
                <div><p className="font-semibold">{order.orderNumber}</p><p className="text-sm text-[var(--muted)]">{formatCurrency(order.total)}</p></div>
                <StatusBadge>{order.status}</StatusBadge>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[28px] bg-white p-6 shadow-[var(--shadow-ambient)]">
          <h2 className="font-display text-2xl font-semibold">Sản phẩm mới cập nhật</h2>
          <div className="mt-4 space-y-3">
            {data.recentProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-2xl bg-[var(--surface-low)] p-4">
                <div><p className="font-semibold">{product.name}</p><p className="text-sm text-[var(--muted)]">{formatCurrency(product.basePrice)}</p></div>
                <StatusBadge>{product.status}</StatusBadge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
