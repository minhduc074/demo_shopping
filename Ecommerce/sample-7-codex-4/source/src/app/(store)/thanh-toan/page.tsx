import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/forms";
import { StoreShell } from "@/components/layout";
import { EmptyState, SectionTitle } from "@/components/ui";
import { requireUser } from "@/lib/auth/session";
import { getShippingMethods } from "@/modules/orders/service";
import { getProfile } from "@/modules/users/service";

export default async function CheckoutPage() {
  const user = await requireUser();
  const [shippingMethods, profileBundle] = await Promise.all([getShippingMethods(), getProfile(user.id)]);

  if (!shippingMethods.length) {
    return (
      <StoreShell>
        <section className="section-shell pt-10">
          <EmptyState title="Chưa cấu hình shipping_methods" description="Bổ sung dữ liệu bảng shipping_methods để bật luồng checkout hoàn chỉnh." />
        </section>
      </StoreShell>
    );
  }

  if (!user) {
    redirect("/dang-nhap");
  }

  return (
    <StoreShell>
      <section className="section-shell pt-10">
        <SectionTitle title="Thanh toán" description="Tạo đơn hàng bằng transaction: orders + order_items + địa chỉ giao hàng." />
        <CheckoutForm shippingMethods={shippingMethods} profile={profileBundle.profile} />
      </section>
    </StoreShell>
  );
}
