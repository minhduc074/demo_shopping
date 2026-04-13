import { StoreShell } from "@/components/layout";
import { EmptyState, Pagination, ProductCard, SectionTitle } from "@/components/ui";
import { getCatalogData } from "@/modules/catalog/service";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string; page?: string }>;
}) {
  const params = await searchParams;
  const data = await getCatalogData({
    q: params.q,
    category: params.category,
    sort: params.sort,
    page: Number(params.page || 1),
  });

  return (
    <StoreShell>
      <section className="section-shell pt-10">
        <SectionTitle title="Tìm kiếm & Danh mục" description="Tất cả filter/sort/pagination đều chạy bằng truy vấn SQL thật qua Drizzle." />
        <form className="mb-8 grid gap-4 rounded-[24px] bg-white p-5 shadow-[var(--shadow-ambient)] md:grid-cols-[2fr_1fr_1fr_auto]">
          <input defaultValue={params.q ?? ""} name="q" placeholder="Tìm theo tên hoặc mô tả" className="rounded-2xl bg-[var(--surface-low)] px-4 py-4" />
          <select defaultValue={params.category ?? ""} name="category" className="rounded-2xl bg-[var(--surface-low)] px-4 py-4">
            <option value="">Tất cả danh mục</option>
            {data.categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
          <select defaultValue={params.sort ?? "latest"} name="sort" className="rounded-2xl bg-[var(--surface-low)] px-4 py-4">
            <option value="latest">Mới nhất</option>
            <option value="price-asc">Giá tăng dần</option>
            <option value="price-desc">Giá giảm dần</option>
            <option value="oldest">Cũ nhất</option>
          </select>
          <button className="editorial-gradient rounded-full px-5 py-4 font-semibold text-white">Lọc</button>
        </form>

        {data.items.length ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {data.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <Pagination page={data.pagination.page} total={data.pagination.total} pageSize={data.pagination.pageSize} basePath="/san-pham" query={{ q: params.q, category: params.category, sort: params.sort }} />
          </>
        ) : (
          <EmptyState title="Không tìm thấy sản phẩm" description="Hãy kiểm tra dữ liệu trong bảng products hoặc thay đổi bộ lọc." />
        )}
      </section>
    </StoreShell>
  );
}
