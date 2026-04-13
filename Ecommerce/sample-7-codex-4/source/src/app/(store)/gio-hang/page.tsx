/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { removeCartItemAction, updateCartItemAction } from "@/app/actions";
import { StoreShell } from "@/components/layout";
import { EmptyState, PrimaryLink, SectionTitle } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth/session";
import { formatCurrency } from "@/lib/utils";
import { getCart } from "@/modules/cart/service";

export default async function CartPage() {
  const user = await getCurrentUser();
  const data = await getCart(user?.id ?? null);

  return (
    <StoreShell>
      <section className="section-shell pt-10">
        <SectionTitle title="Giỏ hàng" description="Dữ liệu giỏ hàng được đọc từ bảng carts và cart_items." />
        {data.items.length ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {data.items.map((item) => (
                <div key={item.id} className="grid gap-4 rounded-[24px] bg-white p-5 shadow-[var(--shadow-ambient)] md:grid-cols-[140px_1fr_auto]">
                  {item.productThumbnail ? <img src={item.productThumbnail} alt={item.productName} className="aspect-[4/5] rounded-[20px] object-cover" /> : <div className="aspect-[4/5] rounded-[20px] bg-[var(--surface-low)]" />}
                  <div className="space-y-2">
                    <Link href={`/san-pham/${item.productSlug}`} className="font-display text-2xl font-semibold">{item.productName}</Link>
                    {item.variantName ? <p className="text-sm text-[var(--muted)]">{item.variantName}</p> : null}
                    <p className="text-lg font-semibold">{formatCurrency(item.unitPrice)}</p>
                  </div>
                  <div className="space-y-3">
                    <form action={updateCartItemAction} className="flex items-center gap-2">
                      <input type="hidden" name="itemId" value={item.id} />
                      <input type="number" name="quantity" min={1} defaultValue={item.quantity} className="w-20 rounded-2xl bg-[var(--surface-low)] px-3 py-3" />
                      <button className="rounded-full bg-[var(--surface-low)] px-4 py-3 text-sm font-semibold">Cập nhật</button>
                    </form>
                    <form action={removeCartItemAction}>
                      <input type="hidden" name="itemId" value={item.id} />
                      <button className="text-sm font-semibold text-[var(--danger)]">Xóa</button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
            <aside className="space-y-4 rounded-[28px] bg-white p-6 shadow-[var(--shadow-ambient)]">
              <h3 className="font-display text-2xl font-semibold">Tóm tắt đơn</h3>
              <div className="space-y-2 text-sm text-[var(--muted)]">
                <div className="flex justify-between"><span>Số lượng</span><span>{data.summary.quantity}</span></div>
                <div className="flex justify-between"><span>Tạm tính</span><span>{formatCurrency(data.summary.subtotal)}</span></div>
              </div>
              {user ? (
                <PrimaryLink href="/thanh-toan" className="w-full">Tiến hành thanh toán</PrimaryLink>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-[var(--muted)]">Vui lòng đăng nhập để tiếp tục thanh toán và lưu lịch sử đơn hàng.</p>
                  <PrimaryLink href="/dang-nhap" className="w-full">Đăng nhập để thanh toán</PrimaryLink>
                </div>
              )}
            </aside>
          </div>
        ) : (
          <EmptyState title="Giỏ hàng đang trống" description="Thêm sản phẩm từ danh sách hoặc trang chi tiết để bắt đầu." action={<PrimaryLink href="/san-pham">Khám phá sản phẩm</PrimaryLink>} />
        )}
      </section>
    </StoreShell>
  );
}
