import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { getFeaturedProducts } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";

export default async function HomePage() {
  const products = await getFeaturedProducts();
  const heroProduct = products[0];

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">Modern E-commerce UI / Stitch recreation</div>
          <h1>Săn sale theo phong cách editorial, không theo lối lưới cũ.</h1>
          <p>
            Sông Hồng Core tái hiện tinh thần &quot;Kinetic Curator&quot; từ Stitch: khoảng thở rộng,
            lớp nền tonal, CTA coral nổi bật, và cảm giác mua sắm như đang xem một tạp chí số cao cấp.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" href="/products">
              Khám phá bộ sưu tập
            </Link>
            <Link className="secondary-button" href="/checkout">
              Đi đến thanh toán
            </Link>
          </div>
        </div>
        <aside className="hero-card">
          <Image src={heroProduct.image} alt={heroProduct.name} width={900} height={1100} priority />
          <div className="eyebrow" style={{ color: "#5b403b" }}>Editor&apos;s pick</div>
          <h2>{heroProduct.name}</h2>
          <p className="muted-text" style={{ color: "#5b403b" }}>{heroProduct.description}</p>
          <div className="price-row">
            <div className="price">{formatCurrency(heroProduct.price)}</div>
            <Link href={`/products/${heroProduct.slug}`}>Mua ngay</Link>
          </div>
        </aside>
      </section>

      <div className="section-stack">
        <section className="section-shell">
          <div className="section-header">
            <div>
              <div className="eyebrow" style={{ color: "#5b403b" }}>Flash sale tracker</div>
              <h2 className="section-heading">Gợi ý hôm nay</h2>
            </div>
            <p className="page-intro">
              Các khối sản phẩm được dàn theo nhịp bất đối xứng để bám tinh thần màn hình Trang chủ và Danh sách sản phẩm từ Stitch.
            </p>
          </div>
          <div className="editorial-grid">
            {products.map((product, index) => {
              const classes = ["masonry-a", "masonry-b", "masonry-c", "masonry-d", "masonry-e", "masonry-f"];
              return <ProductCard key={product.slug} product={product} className={classes[index % classes.length]} />;
            })}
          </div>
        </section>

        <section className="highlight-banner">
          <div>
            <div className="eyebrow" style={{ color: "#5b403b" }}>Trải nghiệm đồng bộ</div>
            <h2>Giỏ hàng, thanh toán và hồ sơ đều dùng chung một nhịp điệu thị giác.</h2>
            <p className="page-intro">
              Điều này giúp toàn bộ journey từ khám phá đến checkout vẫn giữ cảm giác cao cấp thay vì trở thành một màn hình form khô cứng.
            </p>
          </div>
          <div className="inline-actions">
            <Link className="status-pill" href="/cart">Xem giỏ hàng</Link>
            <Link className="cta-chip" href="/account">Hồ sơ của tôi</Link>
          </div>
        </section>
      </div>

      <p className="footer-note">Stitch references đã được lưu trong thư mục `stitch-assets/` để tiếp tục tinh chỉnh pixel-perfect.</p>
    </div>
  );
}
