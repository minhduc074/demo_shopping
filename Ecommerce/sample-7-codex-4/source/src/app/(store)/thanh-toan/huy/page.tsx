import { StoreShell } from "@/components/layout";
import { PageHero, PrimaryLink, SecondaryLink } from "@/components/ui";

export default function CheckoutCancelPage() {
  return (
    <StoreShell>
      <PageHero
        eyebrow="Thanh toán chưa hoàn tất"
        title="Bạn đã hủy phiên Stripe Checkout."
        description="Đơn hàng Stripe vẫn ở trạng thái chờ thanh toán. Bạn có thể quay lại checkout để thử lại hoặc chọn phương thức khác."
        actions={
          <>
            <PrimaryLink href="/thanh-toan">Quay lại thanh toán</PrimaryLink>
            <SecondaryLink href="/gio-hang">Về giỏ hàng</SecondaryLink>
          </>
        }
      />
    </StoreShell>
  );
}
