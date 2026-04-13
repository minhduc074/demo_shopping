import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <main className="section-shell grid gap-8 py-10 lg:grid-cols-[260px_1fr]">
      <aside className="h-fit rounded-[28px] bg-white p-5 shadow-[var(--shadow-ambient)]">
        <p className="font-display text-2xl font-semibold text-[var(--primary)]">Admin</p>
        <nav className="mt-5 space-y-2">
          <Link href="/admin" className="block rounded-2xl px-4 py-3 font-semibold hover:bg-[var(--surface-low)]">Tổng quan</Link>
          <Link href="/admin/san-pham" className="block rounded-2xl px-4 py-3 font-semibold hover:bg-[var(--surface-low)]">Sản phẩm</Link>
          <Link href="/admin/don-hang" className="block rounded-2xl px-4 py-3 font-semibold hover:bg-[var(--surface-low)]">Đơn hàng</Link>
        </nav>
      </aside>
      <div>{children}</div>
    </main>
  );
}
