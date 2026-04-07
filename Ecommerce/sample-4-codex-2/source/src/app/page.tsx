import Link from "next/link";
import { CategoryCard, PageIntro, ProductCard, SectionHeading } from "@/components/commerce";
import { getFeaturedCategories, getFeaturedProducts, getNewArrivals } from "@/lib/store";

export default async function HomePage() {
  const [categories, featuredProducts, newArrivals] = await Promise.all([
    getFeaturedCategories(),
    getFeaturedProducts(),
    getNewArrivals(),
  ]);

  return (
    <div className="content-shell space-y-10">
      <PageIntro
        action={
          <Link className="signature-button" href="/search">
            Shop The Collection
          </Link>
        }
        description="A Next.js 14 storefront translated from Stitch screens into type-safe App Router pages, backed by Prisma on PostgreSQL with zero mock data."
        eyebrow="Stitch Project 16350391539561472399"
        title="Editorial commerce with a real database underneath."
      />

      <section>
        <SectionHeading copy="Categories seeded from Stitch-inspired asset groups." title="Browse by category" />
        <div className="flex gap-5 overflow-x-auto pb-2">
          {categories.map((category) => (
            <CategoryCard category={category} key={category.id} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeading
          action={
            <Link className="text-sm font-semibold text-[--primary]" href="/search">
              View all products
            </Link>
          }
          copy="Featured products come straight from Prisma queries."
          title="Featured picks"
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] bg-[--surface-low] p-6 sm:p-8">
        <SectionHeading copy="New arrivals keep the homepage moving without hard-coded content." title="Just added" />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {newArrivals.map((product) => (
            <ProductCard compact key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
