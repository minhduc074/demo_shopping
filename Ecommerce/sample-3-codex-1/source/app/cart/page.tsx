import Image from "next/image";
import Link from "next/link";
import { updateCartItemQuantityAction } from "@/app/actions";
import { getCartSummary } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";

export default async function CartPage() {
  const { items, subtotal, shipping, discount, total } = await getCartSummary();

  return (
    <div className="page">
      <div className="page-intro">
        <div className="eyebrow" style={{ color: "#5b403b" }}>Giỏ hàng</div>
        <h1>Giữ cảm giác curated ngay cả khi người dùng chuẩn bị thanh toán.</h1>
        <p>Màn hình này bám lại layout hai cột, khối summary dính và các card nền tonal như trong Stitch.</p>
      </div>
      <section className="cart-layout">
        <div className="cart-items">
          {!items.length ? (
            <div className="stat-card">
              <h3>Giỏ hàng đang trống</h3>
              <p className="page-intro">Hãy thêm sản phẩm từ trang chi tiết để kiểm tra giỏ hàng thật lưu trong PostgreSQL.</p>
            </div>
          ) : items.map((item) => (
            <article key={item.id} className="cart-item">
              <Image src={item.product.image} alt={item.product.name} width={240} height={260} />
              <div>
                <div className="product-meta">{item.product.category}</div>
                <h3>{item.product.name}</h3>
                <p className="muted-text" style={{ color: "#5b403b" }}>
                  Size {item.size} / Màu {item.color}
                </p>
              </div>
              <div>
                <div className="price">{formatCurrency(item.product.price)}</div>
                <div className="inline-actions" style={{ marginTop: 10 }}>
                  <form action={updateCartItemQuantityAction}>
                    <input type="hidden" name="itemId" value={item.id} />
                    <input type="hidden" name="quantity" value={item.quantity - 1} />
                    <button type="submit" className="filter-chip" style={{ border: 0, cursor: "pointer" }}>-</button>
                  </form>
                  <span className="product-meta">SL {item.quantity}</span>
                  <form action={updateCartItemQuantityAction}>
                    <input type="hidden" name="itemId" value={item.id} />
                    <input type="hidden" name="quantity" value={item.quantity + 1} />
                    <button type="submit" className="filter-chip" style={{ border: 0, cursor: "pointer" }}>+</button>
                  </form>
                </div>
              </div>
            </article>
          ))}
        </div>
        <aside className="summary-card">
          <h2>Tạm tính</h2>
          <div className="summary-list">
            <div className="summary-row"><span>Tạm tính</span><strong>{formatCurrency(subtotal)}</strong></div>
            <div className="summary-row"><span>Vận chuyển</span><strong>{formatCurrency(shipping)}</strong></div>
            <div className="summary-row"><span>Ưu đãi</span><strong>-{formatCurrency(discount)}</strong></div>
            <div className="summary-row total"><span>Tổng cộng</span><strong>{formatCurrency(total)}</strong></div>
          </div>
          <div className="inline-actions" style={{ marginTop: 18 }}>
            <Link className="cta-chip" href="/checkout">Tiến hành thanh toán</Link>
            <Link className="filter-chip active" href="/products">Mua thêm</Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
