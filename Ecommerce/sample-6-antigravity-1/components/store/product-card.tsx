import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import type { ProductCard } from "@/lib/contracts";

export function ProductCard({ product }: { product: ProductCard }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1rem] bg-white shadow-[0_16px_36px_rgba(45,47,47,0.06)]">
      <Link className="relative block aspect-[4/5] overflow-hidden bg-[var(--color-surface-low)]" href={`/products/${product.slug}`}>
        <Image
          alt={product.name}
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          src={product.imageUrl}
        />
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]">
            {product.category}
          </p>
          <Link className="block text-lg font-semibold text-[var(--color-text)] hover:underline" href={`/products/${product.slug}`}>
            {product.name}
          </Link>
          <p className="text-sm leading-6 text-[var(--color-text-muted)] line-clamp-2">{product.shortDescription}</p>
        </div>
        <div className="mt-auto flex items-end justify-between gap-4">
          <div>
            <p className="text-lg font-bold text-[var(--color-text)]">{formatCurrency(product.price)}</p>
            {product.compareAtPrice && product.compareAtPrice > product.price ? (
              <p className="text-sm text-[var(--color-text-muted)] line-through">
                {formatCurrency(product.compareAtPrice)}
              </p>
            ) : null}
          </div>
          <span className="rounded-full bg-[var(--color-surface-high)] px-3 py-1 text-xs font-medium text-[var(--color-text-muted)]">
            {product.inventoryLabel}
          </span>
        </div>
      </div>
    </article>
  );
}
