import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { addToCartAction } from "@/app/actions";
import { getProductBySlug } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const gallery = product.gallery?.length ? product.gallery : [product.image, product.image, product.image];

  return (
    <div className="page">
      <div className="page-intro">
        <div className="eyebrow" style={{ color: "#5b403b" }}>Chi tiết sản phẩm</div>
        <h1>{product.name}</h1>
        <p>{product.longDescription ?? product.description}</p>
      </div>

      <section className="product-detail-layout">
        <div className="product-media">
          <Image src={product.image} alt={product.name} width={1200} height={1500} priority />
          <div className="thumb-row">
            {gallery.slice(0, 3).map((image) => (
              <Image key={image} src={image} alt={product.name} width={400} height={400} />
            ))}
          </div>
        </div>

        <div className="product-detail-copy">
          <div className="badge-row">
            {(product.tags ?? []).map((tag) => (
              <span key={tag} className="badge">{tag}</span>
            ))}
          </div>
          <div className="price">{formatCurrency(product.price)}</div>
          <p className="page-intro">{product.description}</p>
          <div className="info-grid">
            <div className="stat-card">
              <div className="metric-label" style={{ color: "#5b403b" }}>Đánh giá</div>
              <div className="metric-value">{product.rating?.toFixed(1) ?? "4.8"}</div>
            </div>
            <div className="stat-card">
              <div className="metric-label" style={{ color: "#5b403b" }}>Còn lại</div>
              <div className="metric-value">{product.inventory}</div>
            </div>
          </div>
          <div className="spec-list">
            <div className="summary-row"><span>Chất liệu</span><strong>Linen / Satin premium</strong></div>
            <div className="summary-row"><span>Vận chuyển</span><strong>2h nội thành HCM</strong></div>
            <div className="summary-row"><span>Đổi trả</span><strong>Trong 7 ngày</strong></div>
          </div>
          <div className="inline-actions">
            <form action={addToCartAction}>
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="size" value="M" />
              <input type="hidden" name="color" value="Mặc định" />
              <button type="submit" className="status-pill" style={{ border: 0, cursor: "pointer" }}>
                Thêm vào giỏ
              </button>
            </form>
            <Link href="/checkout" className="cta-chip">Mua ngay</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
