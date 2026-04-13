/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { cn, formatCurrency } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <section className="section-shell pt-8 md:pt-12">
      <div className="grid gap-8 overflow-hidden rounded-[28px] bg-[rgba(255,255,255,0.7)] p-8 shadow-[var(--shadow-ambient)] md:grid-cols-[1.15fr_0.85fr] md:p-12">
        <div className="space-y-5">
          {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">{eyebrow}</p> : null}
          <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight text-balance md:text-6xl">{title}</h1>
          <p className="max-w-2xl text-lg leading-8 text-[var(--muted)]">{description}</p>
          {actions ? <div className="flex flex-wrap gap-4 pt-2">{actions}</div> : null}
        </div>
        <div className="rounded-[24px] bg-[linear-gradient(135deg,rgba(178,34,3,0.95),rgba(255,119,91,0.9))] p-8 text-white">
          <p className="text-sm uppercase tracking-[0.22em] text-white/70">The Vibrant Curator</p>
          <div className="mt-5 space-y-5">
            <p className="font-display text-3xl font-semibold leading-tight">Mua sắm theo nhịp biên tập, không theo cảm giác lộn xộn.</p>
            <p className="text-sm leading-7 text-white/78">
              Hệ thống này bám theo design system Stitch: surface layering, typography Be Vietnam Pro, CTA gradient và nhịp thở rộng.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PrimaryLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn("editorial-gradient inline-flex items-center justify-center rounded-full px-6 py-3 font-semibold text-white transition hover:scale-[1.01]", className)}>
      {children}
    </Link>
  );
}

export function SecondaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center justify-center rounded-full bg-[var(--surface-mid)] px-6 py-3 font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-high)]">
      {children}
    </Link>
  );
}

export function SectionTitle({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="font-display text-3xl font-semibold">{title}</h2>
        {description ? <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function ProductCard({
  product,
}: {
  product: {
    id: string;
    slug: string;
    name: string;
    shortDescription?: string | null;
    thumbnailUrl?: string | null;
    basePrice: string | number;
    compareAtPrice?: string | number | null;
    brand?: string | null;
  };
}) {
  return (
    <Link href={`/san-pham/${product.slug}`} className="group flex flex-col rounded-[22px] bg-white p-4 shadow-[var(--shadow-ambient)] transition hover:-translate-y-1">
      <div className="aspect-[4/5] overflow-hidden rounded-[18px] bg-[var(--surface-low)]">
        {product.thumbnailUrl ? (
          <img src={product.thumbnailUrl} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">Chưa có ảnh</div>
        )}
      </div>
      <div className="space-y-3 px-1 pt-5">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--primary)]">{product.brand || "The Editorial"}</p>
        <div>
          <h3 className="font-display text-xl font-semibold leading-snug">{product.name}</h3>
          {product.shortDescription ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">{product.shortDescription}</p> : null}
        </div>
        <div className="flex items-end gap-3 pt-2">
          <span className="text-xl font-semibold">{formatCurrency(product.basePrice)}</span>
          {product.compareAtPrice ? <span className="text-sm text-[var(--muted)] line-through">{formatCurrency(product.compareAtPrice)}</span> : null}
        </div>
      </div>
    </Link>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-[24px] bg-white p-10 text-center shadow-[var(--shadow-ambient)]">
      <h3 className="font-display text-2xl font-semibold">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--muted)]">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function StatusBadge({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "warning" | "success" | "danger" }) {
  const classes =
    tone === "warning"
      ? "bg-[rgba(252,184,0,0.18)] text-[#5e4200]"
      : tone === "success"
        ? "bg-[rgba(0,102,101,0.16)] text-[var(--secondary)]"
        : tone === "danger"
          ? "bg-[rgba(180,19,64,0.12)] text-[var(--danger)]"
          : "bg-[var(--surface-low)] text-[var(--foreground)]";

  return <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]", classes)}>{children}</span>;
}

export function Pagination({ page, total, pageSize, basePath, query }: { page: number; total: number; pageSize: number; basePath: string; query?: Record<string, string | undefined> }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (totalPages <= 1) {
    return null;
  }

  const linkForPage = (targetPage: number) => {
    const search = new URLSearchParams();
    Object.entries(query ?? {}).forEach(([key, value]) => {
      if (value) {
        search.set(key, value);
      }
    });
    search.set("page", String(targetPage));
    return `${basePath}?${search.toString()}`;
  };

  return (
    <div className="flex items-center justify-center gap-3 pt-6">
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
        <Link
          key={item}
          href={linkForPage(item)}
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold",
            item === page ? "editorial-gradient text-white" : "bg-white text-[var(--foreground)] shadow-[var(--shadow-soft)]",
          )}
        >
          {item}
        </Link>
      ))}
    </div>
  );
}
