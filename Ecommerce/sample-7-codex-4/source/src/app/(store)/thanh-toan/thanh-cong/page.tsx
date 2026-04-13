import { StoreShell } from "@/components/layout";
import { PageHero, PrimaryLink, SecondaryLink } from "@/components/ui";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;

  return (
    <StoreShell>
      <PageHero
        eyebrow="Thanh toán thành công"
        title="Stripe Checkout đã hoàn tất."
        description="Webhook Stripe sẽ xác nhận thanh toán và cập nhật đơn hàng trong cơ sở dữ liệu. Nếu trạng thái chưa đổi ngay, hãy tải lại sau vài giây."
        actions={
          <>
            {orderId ? <PrimaryLink href={`/tai-khoan/don-hang/${orderId}`}>Xem đơn hàng</PrimaryLink> : null}
            <SecondaryLink href="/">Về trang chủ</SecondaryLink>
          </>
        }
      />
    </StoreShell>
  );
}
