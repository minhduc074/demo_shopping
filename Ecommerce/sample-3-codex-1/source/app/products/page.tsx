import { ProductCard } from "@/components/product-card";
import { getCatalog } from "@/lib/catalog";

const filters = ["Tất cả", "Mới ra mắt", "Công sở", "Street luxe", "Phụ kiện"];

export default async function ProductsPage() {
  const products = await getCatalog();

  return (
    <div className="page">
      <div className="page-intro">
        <div className="eyebrow" style={{ color: "#5b403b" }}>Danh sách sản phẩm</div>
        <h1>Khám phá catalogue theo nhịp bất đối xứng của Stitch.</h1>
        <p>
          Bộ lọc, banner và card bo góc lớn được tổ chức để phản chiếu màn hình &quot;Danh sách sản phẩm - Sông Hồng Core&quot;.
        </p>
      </div>

      <section className="section-shell" style={{ marginTop: 28 }}>
        <div className="filter-row">
          {filters.map((filter, index) => (
            <span key={filter} className={`filter-chip ${index === 0 ? "active" : ""}`.trim()}>{filter}</span>
          ))}
        </div>
        <div className="catalog-grid">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
