import Link from "next/link";
import { createStripeCheckoutSessionAction } from "@/app/actions";
import { getCartSummary } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";

export default async function CheckoutPage() {
  const { items, shipping, discount, total } = await getCartSummary();

  return (
    <div className="page">
      <div className="page-intro">
        <div className="eyebrow" style={{ color: "#5b403b" }}>Thanh toán</div>
        <h1>Form thanh toán sạch, mềm và đủ &quot;thở&quot; để không phá mood mua sắm.</h1>
        <p>Trường nhập dùng nền cao hơn thay cho border cứng, bám đúng tinh thần no-line rule của design system.</p>
      </div>

      <section className="checkout-layout">
        <div className="form-card">
          <h2>Thông tin giao hàng</h2>
          <div className="form-grid" style={{ marginTop: 18 }}>
            <label className="field">
              <span>Họ và tên</span>
              <input defaultValue="Thảo Thịnh" />
            </label>
            <label className="field">
              <span>Số điện thoại</span>
              <input defaultValue="0901 234 567" />
            </label>
            <label className="field-full">
              <span>Email</span>
              <input defaultValue="thao@songhongcore.vn" />
            </label>
            <label className="field-full">
              <span>Địa chỉ nhận hàng</span>
              <textarea defaultValue="18 Nguyễn Đình Chiểu, Phường Đa Kao, Quận 1, TP. Hồ Chí Minh" />
            </label>
            <label className="field">
              <span>Thành phố</span>
              <select defaultValue="HCM">
                <option value="HCM">TP. Hồ Chí Minh</option>
                <option value="HN">Hà Nội</option>
                <option value="DN">Đà Nẵng</option>
              </select>
            </label>
            <label className="field">
              <span>Hình thức thanh toán</span>
              <select defaultValue="stripe">
                <option value="stripe">Stripe Checkout (test)</option>
                <option value="cod">Thanh toán khi nhận hàng</option>
              </select>
            </label>
          </div>
        </div>

        <aside className="summary-card">
          <h2>Đơn hàng</h2>
          <div className="summary-list" style={{ marginTop: 14 }}>
            {!items.length ? (
              <div className="summary-row"><span>Giỏ hàng trống</span><strong>0 ₫</strong></div>
            ) : null}
            {items.map((item) => (
              <div key={item.id} className="summary-row">
                <span>{item.product.name} x{item.quantity}</span>
                <strong>{formatCurrency(item.product.price * item.quantity)}</strong>
              </div>
            ))}
            <div className="summary-row"><span>Phí vận chuyển</span><strong>{formatCurrency(shipping)}</strong></div>
            <div className="summary-row"><span>Ưu đãi member</span><strong>-{formatCurrency(discount)}</strong></div>
            <div className="summary-row total"><span>Tổng thanh toán</span><strong>{formatCurrency(total)}</strong></div>
          </div>
          <div className="inline-actions" style={{ marginTop: 18 }}>
            <form action={createStripeCheckoutSessionAction}>
              <button type="submit" className="cta-chip" style={{ border: 0, cursor: "pointer" }} disabled={!items.length}>
                Thanh toán trực tiếp với Stripe
              </button>
            </form>
            <Link className="filter-chip active" href="/cart">Quay lại giỏ hàng</Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
