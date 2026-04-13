import { StoreShell } from "@/components/layout";
import { EmptyState, PageHero, PrimaryLink, ProductCard, SectionTitle, SecondaryLink } from "@/components/ui";
import { getHomepageData } from "@/modules/catalog/service";

export default async function HomePage() {
  const data = await getHomepageData();

  return (
    <StoreShell>
      <PageHero
        eyebrow="Thiết kế Stitch x dữ liệu thật"
        title="Mua sắm theo nhịp biên tập, đọc trực tiếp từ PostgreSQL."
        description="Storefront, checkout, tài khoản và admin chạy trong cùng một codebase Next.js App Router, dùng repository/service rõ ràng và không có mock business data."
        actions={
          <>
            <PrimaryLink href="/san-pham">Khám phá sản phẩm</PrimaryLink>
            <SecondaryLink href="/admin">Đi tới quản trị</SecondaryLink>
          </>
        }
      />

      <section className="section-shell mt-12">
        <SectionTitle title="Danh mục nổi bật" description="Danh mục lấy trực tiếp từ bảng categories." />
        {data.topCategories.length ? (
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            {data.topCategories.map((category) => (
              <a key={category.id} href={`/san-pham?category=${category.slug}`} className="rounded-[24px] bg-white p-5 shadow-[var(--shadow-ambient)]">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--primary)]">Danh mục</p>
                <h3 className="mt-4 font-display text-xl font-semibold">{category.name}</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">{category.description || "Chuyển tới danh mục để xem danh sách sản phẩm."}</p>
              </a>
            ))}
          </div>
        ) : (
          <EmptyState title="Chưa có danh mục" description="Bảng categories hiện chưa có dữ liệu hoặc schema chưa tương thích." />
        )}
      </section>

      <section className="section-shell mt-14">
        <SectionTitle title="Bộ sưu tập nổi bật" description="Sản phẩm đánh dấu is_featured = true." action={<PrimaryLink href="/san-pham">Xem tất cả</PrimaryLink>} />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {data.featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="section-shell mt-14">
        <SectionTitle title="Mới cập nhật" description="Danh sách này phản ánh dữ liệu mới nhất từ bảng products." />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {data.latestProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </StoreShell>
  );
}
