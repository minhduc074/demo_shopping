import Image from "next/image";
import Link from "next/link";
import { type Category, type Order, type Product } from "@prisma/client";
import { format } from "date-fns";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/forms";
import { cn, formatCurrency } from "@/lib/utils";

type ProductWithCategory = Product & { category: Category };

export async function AppHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link className="text-2xl font-black italic tracking-tight text-[--primary]" href="/">
            The Curator
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-medium text-[--muted] md:flex">
            <Link href="/">Home</Link>
            <Link href="/search">Search</Link>
            <Link href="/orders">My Orders</Link>
            <Link href="/admin">Admin</Link>
            <Link href="/design-system">Design System</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <Link className="rounded-full bg-[--surface-low] px-4 py-2 font-medium text-[--ink]" href={user.role === "ADMIN" ? "/admin" : "/orders"}>
                {user.name}
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link className="rounded-full bg-[--surface-low] px-4 py-2 font-medium text-[--ink]" href="/login">
              Login
            </Link>
          )}
          <Link className="signature-button" href="/cart">
            Cart
          </Link>
        </div>
      </div>
    </header>
  );
}

export function AppFooter() {
  return (
    <footer className="border-t border-black/5 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 text-sm text-[--muted] sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
        <p>Built on Next.js 14, Prisma, and PostgreSQL with Stitch-derived assets.</p>
        <div className="flex gap-4">
          <Link href="/checkout">Checkout</Link>
          <Link href="/admin/products">Product Management</Link>
          <Link href="/register">Register</Link>
        </div>
      </div>
    </footer>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] bg-white p-8 shadow-[0_20px_60px_rgba(45,47,47,0.06)] sm:p-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[--primary]">{eyebrow}</p>
          <h1 className="text-4xl font-black tracking-[-0.03em] text-[--ink] sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[--muted]">{description}</p>
        </div>
        {action}
      </div>
    </section>
  );
}

export function SectionHeading({
  title,
  copy,
  action,
}: {
  title: string;
  copy?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-[-0.02em] text-[--ink]">{title}</h2>
        {copy ? <p className="mt-2 text-sm text-[--muted]">{copy}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link className="group flex min-w-[220px] flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-[0_16px_40px_rgba(45,47,47,0.06)]" href={`/search?category=${category.slug}`}>
      <div className="relative aspect-[4/3] overflow-hidden bg-[--surface-low]">
        <Image alt={category.name} className="object-cover transition duration-500 group-hover:scale-105" fill src={category.imageUrl} />
      </div>
      <div className="p-5">
        <p className="text-lg font-semibold text-[--ink]">{category.name}</p>
        <p className="mt-2 text-sm leading-6 text-[--muted]">{category.description}</p>
      </div>
    </Link>
  );
}

export function ProductCard({ product, compact = false }: { product: ProductWithCategory; compact?: boolean }) {
  return (
    <article className="group rounded-[1.75rem] bg-white p-4 shadow-[0_16px_40px_rgba(45,47,47,0.06)]">
      <Link className="block" href={`/products/${product.slug}`}>
        <div className={cn("relative overflow-hidden rounded-[1.25rem] bg-[--surface-low]", compact ? "aspect-square" : "aspect-[4/5]")}>
          <Image alt={product.name} className="object-cover transition duration-500 group-hover:scale-[1.03]" fill src={product.imageUrl} />
        </div>
      </Link>
      <div className="pt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[--primary]">{product.category.name}</p>
          <p className="text-xs text-[--muted]">{product.reviewCount} reviews</p>
        </div>
        <Link className="mt-2 block text-lg font-semibold tracking-[-0.02em] text-[--ink]" href={`/products/${product.slug}`}>
          {product.name}
        </Link>
        <p className="mt-2 text-sm leading-6 text-[--muted]">{product.description}</p>
        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xl font-bold text-[--ink]">{formatCurrency(product.priceCents)}</p>
            {product.compareAtCents ? <p className="text-sm text-[--muted] line-through">{formatCurrency(product.compareAtCents)}</p> : null}
          </div>
          <span className="rounded-full bg-[--surface-low] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[--ink]">
            {product.brand}
          </span>
        </div>
      </div>
    </article>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-[1.5rem] bg-white p-6 shadow-[0_16px_40px_rgba(45,47,47,0.06)]">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[--muted]">{label}</p>
      <p className="mt-3 text-3xl font-black tracking-[-0.03em] text-[--ink]">{value}</p>
      <p className="mt-2 text-sm text-[--muted]">{hint}</p>
    </div>
  );
}

export function StatusBadge({ value }: { value: string }) {
  const tone =
    value === "PAID" || value === "FULFILLED" || value === "SHIPPED"
      ? "bg-emerald-50 text-emerald-700"
      : value === "PENDING"
        ? "bg-amber-50 text-amber-700"
        : "bg-[--surface-low] text-[--ink]";

  return <span className={cn("rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]", tone)}>{value}</span>;
}

export function OrderCard({
  order,
}: {
  order: Order & {
    items: { quantity: number; unitPriceCents: number; product: { name: string } }[];
  };
}) {
  return (
    <article className="rounded-[1.5rem] bg-white p-6 shadow-[0_16px_40px_rgba(45,47,47,0.06)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[--primary]">Order {order.orderNumber}</p>
          <h3 className="mt-2 text-xl font-bold text-[--ink]">{order.shippingName}</h3>
          <p className="mt-1 text-sm text-[--muted]">{format(order.createdAt, "PPP")}</p>
        </div>
        <StatusBadge value={order.status} />
      </div>
      <div className="mt-6 space-y-3">
        {order.items.map((item) => (
          <div className="flex items-center justify-between gap-4 text-sm text-[--ink]" key={`${order.id}-${item.product.name}`}>
            <span>
              {item.product.name} x {item.quantity}
            </span>
            <span>{formatCurrency(item.unitPriceCents * item.quantity)}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-black/5 pt-4">
        <span className="text-sm text-[--muted]">{order.shippingEmail}</span>
        <span className="text-lg font-bold text-[--ink]">{formatCurrency(order.totalCents)}</span>
      </div>
    </article>
  );
}

export function EmptyState({
  title,
  copy,
  action,
}: {
  title: string;
  copy: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-black/10 bg-white p-10 text-center">
      <h3 className="text-2xl font-bold text-[--ink]">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[--muted]">{copy}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function AssetShowcase({ images }: { images: { title: string; image: string }[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {images.map((item) => (
        <article className="overflow-hidden rounded-[1.5rem] bg-white shadow-[0_16px_40px_rgba(45,47,47,0.06)]" key={item.title}>
          <div className="relative aspect-[16/10]">
            <Image alt={item.title} className="object-cover object-top" fill src={item.image} />
          </div>
          <div className="border-t border-black/5 px-5 py-4">
            <p className="font-semibold text-[--ink]">{item.title}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
