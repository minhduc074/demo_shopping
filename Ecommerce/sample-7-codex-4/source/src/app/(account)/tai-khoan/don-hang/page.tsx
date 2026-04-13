import Link from "next/link";
import { SectionTitle, StatusBadge } from "@/components/ui";
import { requireUser } from "@/lib/auth/session";
import { formatCurrency } from "@/lib/utils";
import { getUserOrders } from "@/modules/users/service";

export default async function AccountOrdersPage() {
  const user = await requireUser();
  const orders = await getUserOrders(user.id);

  return (
    <div className="space-y-6">
      <SectionTitle title="Đơn hàng của tôi" description="Lịch sử được đọc từ bảng orders theo user_id hiện tại." />
      <div className="space-y-4">
        {orders.map((order) => (
          <Link key={order.id} href={`/tai-khoan/don-hang/${order.id}`} className="grid gap-4 rounded-[24px] bg-white p-5 shadow-[var(--shadow-ambient)] md:grid-cols-[1fr_auto_auto]">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--primary)]">{order.orderNumber}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">Tạo lúc {new Date(order.createdAt).toLocaleString("vi-VN")}</p>
            </div>
            <StatusBadge>{order.status}</StatusBadge>
            <p className="text-lg font-semibold">{formatCurrency(order.total)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
