/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/ui";
import { requireUser } from "@/lib/auth/session";
import { formatCurrency } from "@/lib/utils";
import { getUserOrderDetail } from "@/modules/users/service";

export default async function AccountOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const detail = await getUserOrderDetail(user.id, id);

  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] bg-white p-6 shadow-[var(--shadow-ambient)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--primary)]">{detail.order.orderNumber}</p>
            <h1 className="mt-2 font-display text-3xl font-semibold">Chi tiết đơn hàng</h1>
          </div>
          <StatusBadge>{detail.order.status}</StatusBadge>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-[var(--surface-low)] p-4 text-sm">{detail.order.shippingName}<br />{detail.order.shippingPhone}<br />{[detail.order.shippingLine1, detail.order.shippingLine2, detail.order.shippingWard, detail.order.shippingDistrict, detail.order.shippingProvince].filter(Boolean).join(", ")}</div>
          <div className="rounded-2xl bg-[var(--surface-low)] p-4 text-sm">Thanh toán: {detail.order.paymentMethod}<br />Trạng thái thanh toán: {detail.order.paymentStatus}<br />Tổng tiền: {formatCurrency(detail.order.total)}</div>
        </div>
      </div>
      <div className="space-y-4">
        {detail.items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 rounded-[24px] bg-white p-5 shadow-[var(--shadow-ambient)]">
            {item.productImageUrl ? <img src={item.productImageUrl} alt={item.productName} className="h-24 w-20 rounded-[16px] object-cover" /> : null}
            <div className="flex-1">
              <p className="font-display text-xl font-semibold">{item.productName}</p>
              {item.variantName ? <p className="text-sm text-[var(--muted)]">{item.variantName}</p> : null}
            </div>
            <div className="text-right">
              <p className="font-semibold">{formatCurrency(item.lineTotal)}</p>
              <p className="text-sm text-[var(--muted)]">SL {item.quantity}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
