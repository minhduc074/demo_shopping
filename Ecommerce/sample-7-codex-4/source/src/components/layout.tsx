import Link from "next/link";
import { LogOut, Search, ShoppingCart, UserCircle2 } from "lucide-react";
import { STORE_NAV } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth/session";
import { logoutAction } from "@/app/actions";

export async function StoreHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-white/40 glass-panel">
      <div className="section-shell flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-display text-3xl font-bold italic tracking-tight text-[var(--primary)]">
            The Editorial
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {STORE_NAV.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm font-semibold text-[var(--foreground)] transition hover:text-[var(--primary)]">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/san-pham" className="rounded-full bg-white p-3 shadow-[var(--shadow-soft)]" aria-label="Tìm kiếm">
            <Search className="h-4 w-4" />
          </Link>
          <Link href="/gio-hang" className="rounded-full bg-white p-3 shadow-[var(--shadow-soft)]" aria-label="Giỏ hàng">
            <ShoppingCart className="h-4 w-4" />
          </Link>
          {user ? (
            <div className="flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow-[var(--shadow-soft)]">
              <Link href={user.role === "admin" ? "/admin" : "/tai-khoan"} className="inline-flex items-center gap-2 text-sm font-semibold">
                <UserCircle2 className="h-4 w-4 text-[var(--primary)]" />
                {user.fullName}
              </Link>
              <form action={logoutAction}>
                <button type="submit" className="text-[var(--muted)] transition hover:text-[var(--primary)]" aria-label="Đăng xuất">
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </div>
          ) : (
            <Link href="/dang-nhap" className="editorial-gradient inline-flex rounded-full px-5 py-3 text-sm font-semibold text-white">
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function StoreFooter() {
  return (
    <footer className="mt-20 bg-[var(--surface-low)]">
      <div className="section-shell grid gap-10 py-12 md:grid-cols-4">
        <div className="space-y-3 md:col-span-2">
          <p className="font-display text-2xl font-bold text-[var(--primary)]">The Editorial</p>
          <p className="max-w-xl text-sm leading-7 text-[var(--muted)]">
            Nền tảng thương mại điện tử với kiến trúc production-ready, đọc ghi trực tiếp PostgreSQL và bám sát ngôn ngữ hình ảnh Stitch.
          </p>
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold">Hỗ trợ</h3>
          <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
            <li>Chính sách giao hàng</li>
            <li>Chính sách bảo mật</li>
            <li>Trung tâm trợ giúp</li>
          </ul>
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold">Tài khoản</h3>
          <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
            <li>
              <Link href="/tai-khoan">Hồ sơ khách hàng</Link>
            </li>
            <li>
              <Link href="/tai-khoan/don-hang">Đơn hàng</Link>
            </li>
            <li>
              <Link href="/admin">Quản trị</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export async function StoreShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StoreHeader />
      <main>{children}</main>
      <StoreFooter />
    </>
  );
}
