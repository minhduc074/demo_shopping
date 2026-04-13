import Link from "next/link";
import { StoreShell } from "@/components/layout";
import { requireUser } from "@/lib/auth/session";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return (
    <StoreShell>
      <section className="section-shell grid gap-8 pt-10 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-[28px] bg-white p-5 shadow-[var(--shadow-ambient)]">
          <nav className="space-y-2">
            <Link href="/tai-khoan" className="block rounded-2xl px-4 py-3 font-semibold hover:bg-[var(--surface-low)]">Hồ sơ</Link>
            <Link href="/tai-khoan/don-hang" className="block rounded-2xl px-4 py-3 font-semibold hover:bg-[var(--surface-low)]">Đơn hàng</Link>
          </nav>
        </aside>
        <div>{children}</div>
      </section>
    </StoreShell>
  );
}
