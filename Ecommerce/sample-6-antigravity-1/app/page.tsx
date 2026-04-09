import Link from "next/link";
import { ProductCard } from "@/components/store/product-card";
import { SiteHeader } from "@/components/store/site-header";
import { listCategories, listProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featuredProducts, freshProducts] = await Promise.all([
    listCategories(),
    listProducts({ featured: true, limit: 4 }),
    listProducts({ limit: 8 }),
  ]);

  return (
    <div className="pb-20">
      <SiteHeader />
      <main className="space-y-14 pt-6">
        <section className="section-shell">
          <div className="grid overflow-hidden rounded-[1.25rem] bg-[var(--color-panel)] shadow-[0_20px_50px_rgba(45,47,47,0.08)] lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col justify-center gap-6 px-8 py-10 lg:px-12 lg:py-16">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-secondary)]">
                  New season arrival
                </p>
                <h1 className="mt-4 max-w-xl text-5xl font-black leading-[1.02] tracking-[-0.04em] md:text-7xl">
                  Built independently from scratch.
                </h1>
                <p className="mt-5 max-w-lg text-base leading-7 text-[var(--color-text-muted)]">
                  A premium storefront fully reconstructed by the Antigravity agent, demonstrating type-safe e-commerce operations.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link className="inline-flex rounded-[0.75rem] px-5 py-3 text-sm font-semibold text-white signature-gradient" href="/search">
                  Shop the Collection
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[var(--color-surface-low)] py-14">
          <div className="section-shell">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-secondary)]">Featured</p>
                <h2 className="mt-2 text-3xl font-bold tracking-[-0.03em]">The high-conviction shortlist</h2>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
