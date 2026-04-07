import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sông Hồng Core",
  description: "Editorial-inspired e-commerce storefront built with Next.js, TypeScript, Prisma, and PostgreSQL."
};

const navItems = [
  { href: "/", label: "Trang chủ" },
  { href: "/products", label: "Sản phẩm" },
  { href: "/cart", label: "Gio hang" },
  { href: "/checkout", label: "Thanh toán" },
  { href: "/account", label: "Hồ sơ" }
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <div className="shell">
          <header className="topbar glass-panel">
            <Link href="/" className="brand-mark">
              <span className="brand-kicker">Sông Hồng</span>
              <span className="brand-name">Core</span>
            </Link>
            <nav className="topnav">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="topbar-actions">
              <span className="status-pill">Yêu thích+</span>
              <Link className="cta-chip" href="/checkout">
                Mua ngay
              </Link>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
