/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import { updateOrderStatusAction } from "@/app/actions";
import { StatusBadge } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { getOrderForAdmin } from "@/modules/orders/service";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getOrderForAdmin(id);

  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] bg-white p-6 shadow-[var(--shadow-ambient)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--primary)]">{detail.order.orderNumber}</p>
            <h1 className="mt-2 font-display text-3xl font-semibold">Chi tiết đơn hàng</h1>
          </div>
          <StatusBadge>{detail.order.status}</StatusBadge>
        </div>
        <form action={updateOrderStatusAction} className="mt-6 flex flex-wrap gap-3">
          <input type="hidden" name="orderId" value={detail.order.id} />
          <select name="status" defaultValue={detail.order.status} className="rounded-2xl bg-[var(--surface-low)] px-4 py-4">
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="packing">Packing</option>
            <option value="shipping">Shipping</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="editorial-gradient rounded-full px-5 py-4 font-semibold text-white">Cập nhật trạng thái</button>
        </form>
      </div>
      <div className="space-y-4">
        {detail.items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 rounded-[24px] bg-white p-5 shadow-[var(--shadow-ambient)]">
            {item.productImageUrl ? <img src={item.productImageUrl} alt={item.productName} className="h-24 w-20 rounded-[16px] object-cover" /> : null}
            <div className="flex-1">
              <p className="font-display text-xl font-semibold">{item.productName}</p>
              {item.variantName ? <p className="text-sm text-[var(--muted)]">{item.variantName}</p> : null}
            </div>
            <p className="font-semibold">{formatCurrency(item.lineTotal)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
