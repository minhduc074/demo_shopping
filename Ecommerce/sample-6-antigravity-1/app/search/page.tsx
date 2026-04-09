import { ProductCard } from "@/components/store/product-card";
import { SiteHeader } from "@/components/store/site-header";
import { searchProducts, listCategories } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: { q?: string; category?: string } }) {
  const query = searchParams.q;
  const category = searchParams.category;

  const [response, categories] = await Promise.all([
    searchProducts({ query, category, limit: 24 }),
    listCategories(),
  ]);

  return (
    <div className="pb-20">
      <SiteHeader />
      <main className="section-shell pt-8">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-secondary)]">
            {query ? `Search results for "${query}"` : "Full Catalog"}
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em]">
            {category 
              ? `Curated ${categories.find(c => c.slug === category)?.name || "Category"}`
              : "Discover all items"}
          </h1>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {response.items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {response.items.length === 0 && (
            <p className="text-[var(--color-text-muted)]">No products found matching your criteria.</p>
          )}
        </div>
      </main>
    </div>
  );
}
