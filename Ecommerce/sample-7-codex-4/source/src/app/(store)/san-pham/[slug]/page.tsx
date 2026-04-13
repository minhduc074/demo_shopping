/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import { addToCartAction } from "@/app/actions";
import { StoreShell } from "@/components/layout";
import { ProductCard, SectionTitle, StatusBadge } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { getProductBySlug } from "@/modules/catalog/service";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getProductBySlug(slug);

  if (!data) {
    notFound();
  }

  return (
    <StoreShell>
      <section className="section-shell grid gap-8 pt-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[28px] bg-white p-4 shadow-[var(--shadow-ambient)]">
            {data.images[0]?.imageUrl || data.product.thumbnailUrl ? (
              <img src={data.images[0]?.imageUrl || data.product.thumbnailUrl || ""} alt={data.product.name} className="aspect-[4/5] w-full rounded-[24px] object-cover" />
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center rounded-[24px] bg-[var(--surface-low)] text-[var(--muted)]">Chưa có ảnh</div>
            )}
          </div>
          {data.images.length > 1 ? (
            <div className="grid grid-cols-4 gap-4">
              {data.images.slice(0, 4).map((image) => (
                <img key={image.id} src={image.imageUrl} alt={image.altText || data.product.name} className="aspect-square rounded-[18px] object-cover shadow-[var(--shadow-soft)]" />
              ))}
            </div>
          ) : null}
        </div>
        <div className="space-y-5 rounded-[28px] bg-white p-8 shadow-[var(--shadow-ambient)]">
          <StatusBadge tone="warning">Chi tiết sản phẩm</StatusBadge>
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--primary)]">{data.category?.name || "Danh mục"}</p>
            <h1 className="mt-3 font-display text-4xl font-semibold">{data.product.name}</h1>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{data.product.shortDescription || data.product.description}</p>
          </div>
          <div className="flex items-end gap-4">
            <p className="text-3xl font-semibold">{formatCurrency(data.product.basePrice)}</p>
            {data.product.compareAtPrice ? <p className="text-base text-[var(--muted)] line-through">{formatCurrency(data.product.compareAtPrice)}</p> : null}
          </div>
          {data.variants.length ? (
            <div className="space-y-3">
              <p className="font-semibold">Biến thể khả dụng</p>
              <div className="flex flex-wrap gap-3">
                {data.variants.map((variant) => (
                  <span key={variant.id} className="rounded-full bg-[var(--surface-low)] px-4 py-2 text-sm">
                    {variant.name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          <form action={addToCartAction} className="space-y-4">
            <input type="hidden" name="productId" value={data.product.id} />
            <select name="variantId" className="w-full rounded-2xl bg-[var(--surface-low)] px-4 py-4">
              <option value="">Biến thể mặc định</option>
              {data.variants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.name} - {formatCurrency(variant.price)}
                </option>
              ))}
            </select>
            <input type="number" name="quantity" min={1} defaultValue={1} className="w-32 rounded-2xl bg-[var(--surface-low)] px-4 py-4" />
            <button className="editorial-gradient w-full rounded-full px-5 py-4 font-semibold text-white">Thêm vào giỏ</button>
          </form>
          <article className="rounded-[24px] bg-[var(--surface-low)] p-5 text-sm leading-7 text-[var(--muted)]">
            {data.product.description || "Chưa có mô tả chi tiết."}
          </article>
        </div>
      </section>

      <section className="section-shell mt-14">
        <SectionTitle title="Gợi ý liên quan" description="Lấy từ cùng danh mục nếu dữ liệu có liên kết category_id." />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {data.relatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </StoreShell>
  );
}
