import { notFound } from "next/navigation";
import Image from "next/image";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { SiteHeader } from "@/components/store/site-header";
import { getProductBySlug } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  return (
    <div className="pb-20">
      <SiteHeader />
      <main className="section-shell pt-10">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="flex flex-col gap-4">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.25rem] bg-[var(--color-surface-low)]">
              <Image alt={product.name} className="object-cover" fill priority sizes="(max-width: 1024px) 100vw, 50vw" src={product.imageUrl} />
            </div>
          </div>
          <div className="flex flex-col pt-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]">
              {product.category}
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] md:text-5xl">{product.name}</h1>
            <div className="mt-6 flex items-end gap-4">
              <p className="text-3xl font-bold">{formatCurrency(product.price)}</p>
              {product.compareAtPrice && product.compareAtPrice > product.price ? (
                <p className="mb-1 text-lg text-[var(--color-text-muted)] line-through">
                  {formatCurrency(product.compareAtPrice)}
                </p>
              ) : null}
            </div>
            <div className="mt-8 space-y-6">
              <p className="text-lg leading-8 text-[var(--color-text-muted)]">{product.description}</p>
            </div>
            <div className="mt-10 max-w-sm">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium">
                <span className="flex h-2 w-2 rounded-full bg-green-500" />
                {product.inventoryLabel}
              </div>
              <AddToCartButton productId={product.id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
