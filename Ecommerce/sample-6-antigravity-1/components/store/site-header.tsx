import Link from "next/link";
import { LayoutDashboard, LogIn, LogOut, Package, Search, ShoppingCart } from "lucide-react";
import { getCurrentUserProfile } from "@/lib/auth";
import { getCartForUser } from "@/lib/data";

export async function SiteHeader() {
  const profile = await getCurrentUserProfile().catch(() => null);
  const cart = profile ? await getCartForUser(profile.id).catch(() => null) : null;

  return (
    <header className="sticky top-0 z-50 border-b border-white/40 glass-nav backdrop-blur-3xl bg-opacity-80">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
        <div className="flex min-w-0 flex-1 items-center gap-8">
          <Link className="text-2xl font-black italic tracking-tight text-[var(--color-primary)]" href="/">
            The Curator
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-[var(--color-text-muted)] md:flex">
            <Link href="/">Home</Link>
            <Link href="/search">Shop</Link>
            {profile && <Link href="/orders">Orders</Link>}
            {profile?.role === "ADMIN" && <Link href="/admin">Admin</Link>}
          </nav>
        </div>
        <div className="hidden flex-1 md:block">
          <form action="/search" className="relative">
            <input
              className="w-full rounded-[0.9rem] bg-[var(--color-surface-high)] px-4 py-3 pl-11 text-sm outline-none ring-0 transition focus:border-none focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              name="q"
              placeholder="Search curated products..."
              type="search"
            />
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
          </form>
        </div>
        <div className="flex items-center gap-2">
          <Link className="icon-chip md:hidden" href="/search" aria-label="Search">
            <Search className="size-4" />
          </Link>
          {profile ? (
            <>
              <Link className="icon-chip relative" href="/cart" aria-label="Cart">
                <ShoppingCart className="size-4" />
                {cart && cart.itemCount > 0 ? (
                  <span className="absolute -right-1 -top-1 inline-flex size-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-bold text-white">
                    {cart.itemCount}
                  </span>
                ) : null}
              </Link>
              <form action="/api/auth/logout" method="post">
                <button className="icon-chip" aria-label="Logout" type="submit">
                  <LogOut className="size-4" />
                </button>
              </form>
            </>
          ) : (
            <Link className="icon-chip" href="/login" aria-label="Sign in">
              <LogIn className="size-4" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
