import { getAccountSnapshot } from "@/lib/catalog";

export default async function AccountPage() {
  const account = await getAccountSnapshot();

  return (
    <div className="page">
      <div className="page-intro">
        <div className="eyebrow" style={{ color: "#5b403b" }}>Hồ sơ của tôi</div>
        <h1>Không gian thành viên mang nhịp điệu tạp chí thay vì dashboard khô.</h1>
        <p>Màn hình hồ sơ giữ khối card lớn, số liệu to và những dải nền tách lớp để phản ánh bản Stitch &quot;Hồ sơ của tôi&quot;.</p>
      </div>

      <section className="account-layout">
        <div className="account-main">
          <div>
            <div className="eyebrow" style={{ color: "#5b403b" }}>{account.tier}</div>
            <h2>{account.name}</h2>
            <p className="page-intro">{account.email}</p>
          </div>

          <div className="kpi-grid">
            <article className="stat-card">
              <div className="metric-label" style={{ color: "#5b403b" }}>Đơn hàng</div>
              <div className="metric-value">{account.orders}</div>
            </article>
            <article className="stat-card">
              <div className="metric-label" style={{ color: "#5b403b" }}>Wishlist</div>
              <div className="metric-value">{account.wishlist}</div>
            </article>
            <article className="stat-card">
              <div className="metric-label" style={{ color: "#5b403b" }}>Điểm thưởng</div>
              <div className="metric-value">{account.loyaltyPoints}</div>
            </article>
          </div>
        </div>

        <aside className="summary-card">
          <h2>Thông tin nhanh</h2>
          <div className="account-list" style={{ marginTop: 14 }}>
            <div>
              <strong>Địa chỉ lưu</strong>
              {account.addresses.map((address) => (
                <p key={address} className="muted-text" style={{ color: "#5b403b" }}>{address}</p>
              ))}
            </div>
            <div>
              <strong>Đơn gần đây</strong>
              {account.recentOrders.map((order) => (
                <p key={order} className="muted-text" style={{ color: "#5b403b" }}>{order}</p>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
