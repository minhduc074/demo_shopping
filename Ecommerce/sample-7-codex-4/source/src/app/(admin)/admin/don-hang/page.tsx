import Link from "next/link";
import { SectionTitle, StatusBadge } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { getOrdersForAdmin } from "@/modules/orders/service";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const orders = await getOrdersForAdmin(params);

  return (
    <div className="space-y-6">
      <SectionTitle title="Quản lý đơn hàng" description="Tìm kiếm và lọc trực tiếp trên bảng orders." />
      <form className="grid gap-4 rounded-[24px] bg-white p-5 shadow-[var(--shadow-ambient)] md:grid-cols-[2fr_1fr_auto]">
        <input name="q" defaultValue={params.q ?? ""} placeholder="Tìm theo mã đơn" className="rounded-2xl bg-[var(--surface-low)] px-4 py-4" />
        <select name="status" defaultValue={params.status ?? ""} className="rounded-2xl bg-[var(--surface-low)] px-4 py-4">
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="packing">Packing</option>
          <option value="shipping">Shipping</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button className="editorial-gradient rounded-full px-5 py-4 font-semibold text-white">Lọc</button>
      </form>
      <div className="space-y-4">
        {orders.map((order) => (
          <Link key={order.id} href={`/admin/don-hang/${order.id}`} className="grid gap-4 rounded-[24px] bg-white p-5 shadow-[var(--shadow-ambient)] md:grid-cols-[1fr_auto_auto]">
            <div><p className="font-semibold">{order.orderNumber}</p><p className="mt-1 text-sm text-[var(--muted)]">{order.shippingName}</p></div>
            <StatusBadge>{order.status}</StatusBadge>
            <p className="font-semibold">{formatCurrency(order.total)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
