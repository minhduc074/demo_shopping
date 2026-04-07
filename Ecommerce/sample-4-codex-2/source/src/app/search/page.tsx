import Link from "next/link";
import { PageIntro } from "@/components/commerce";
import { SearchResults } from "@/components/search-results";
import { getAllCategories, searchProducts } from "@/lib/store";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { query?: string; category?: string; page?: string };
}) {
  const currentPage = Number(searchParams.page ?? "1");
  const page = Number.isFinite(currentPage) && currentPage > 0 ? currentPage : 1;
  const [categories, result] = await Promise.all([
    getAllCategories(),
    searchProducts({ query: searchParams.query, category: searchParams.category, page, pageSize: 24 }),
  ]);

  const baseParams = new URLSearchParams();
  if (searchParams.query) {
    baseParams.set("query", searchParams.query);
  }
  if (searchParams.category) {
    baseParams.set("category", searchParams.category);
  }

  const prevHref = (() => {
    const params = new URLSearchParams(baseParams);
    params.set("page", String(Math.max(1, page - 1)));
    return `/search?${params.toString()}`;
  })();

  return (
    <div className="content-shell space-y-10">
      <PageIntro
        description="Search results, category chips, and sorting-friendly product data all come from Prisma queries."
        eyebrow="Search Results"
        title={searchParams.query ? `Results for "${searchParams.query}"` : "Browse the catalog"}
      />
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <Link
            className={`rounded-full px-4 py-2 text-sm font-semibold ${searchParams.category === category.slug ? "bg-[--primary] text-white" : "bg-white text-[--ink]"}`}
            href={`/search?category=${category.slug}`}
            key={category.id}
          >
            {category.name}
          </Link>
        ))}
      </div>
      <SearchResults category={searchParams.category} initialResult={result} prevHref={prevHref} query={searchParams.query} />
    </div>
  );
}
