import Image from "next/image";
import { notFound } from "next/navigation";
import { PageIntro, ProductCard, SectionHeading } from "@/components/commerce";
import { AddToCartButton } from "@/components/forms";
import { getProductBySlug, getRelatedProducts } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.categoryId, product.id);

  return (
    <div className="content-shell space-y-10">
      <PageIntro
        action={<AddToCartButton productId={product.id} />}
        description={product.description}
        eyebrow={product.category.name}
        title={product.name}
      />

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-white shadow-[0_16px_40px_rgba(45,47,47,0.06)]">
            <Image alt={product.name} className="object-cover" fill priority src={product.imageUrl} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {product.gallery.map((image) => (
              <div className="relative aspect-square overflow-hidden rounded-[1.25rem] bg-white" key={image}>
                <Image alt={product.name} className="object-cover" fill src={image} />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6 rounded-[2rem] bg-white p-8 shadow-[0_16px_40px_rgba(45,47,47,0.06)]">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-[--surface-low] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[--primary]">{product.brand}</span>
            <span className="text-sm text-[--muted]">{product.reviewCount} verified reviews</span>
          </div>
          <div>
            <p className="text-4xl font-black tracking-[-0.03em] text-[--ink]">{formatCurrency(product.priceCents)}</p>
            {product.compareAtCents ? <p className="mt-2 text-sm text-[--muted] line-through">{formatCurrency(product.compareAtCents)}</p> : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {product.details.map((detail) => (
              <div className="rounded-[1.25rem] bg-[--surface-low] px-4 py-3 text-sm text-[--ink]" key={detail}>
                {detail}
              </div>
            ))}
          </div>
          <div className="rounded-[1.5rem] bg-[--surface-low] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[--muted]">Inventory</p>
            <p className="mt-3 text-lg font-semibold text-[--ink]">{product.inventory} units available</p>
          </div>
        </div>
      </section>

      <section>
        <SectionHeading copy="More products from the same category, loaded from PostgreSQL." title="Related products" />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {relatedProducts.map((item) => (
            <ProductCard compact key={item.id} product={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
