import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { formatCurrency } from "@/lib/utils";

async function completeOrder(sessionId: string) {
  const existingOrder = await prisma.order.findUnique({
    where: { stripeSessionId: sessionId },
    include: { items: true }
  });

  if (existingOrder) return existingOrder;

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") return null;

  const cartToken = session.metadata?.cartToken;
  if (!cartToken) return null;

  const cart = await prisma.cart.findUnique({
    where: { token: cartToken },
    include: {
      items: {
        include: { product: true }
      }
    }
  });

  if (!cart) return null;

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        stripeSessionId: session.id,
        cartToken,
        status: "paid",
        currency: session.currency ?? "vnd",
        total: session.amount_total ?? 0,
        customerName: session.customer_details?.name ?? undefined,
        customerEmail: session.customer_details?.email ?? undefined,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            unitPrice: item.product.price,
            quantity: item.quantity
          }))
        }
      },
      include: { items: true }
    });

    await tx.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    return order;
  });
}

export default async function CheckoutSuccessPage({
  searchParams
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  if (!sessionId) notFound();

  const order = await completeOrder(sessionId);
  if (!order) notFound();

  return (
    <div className="page">
      <div className="page-intro">
        <div className="eyebrow" style={{ color: "#5b403b" }}>Thanh toán thành công</div>
        <h1>Cảm ơn bạn, đơn hàng đã được ghi nhận và giỏ hàng đã được làm mới.</h1>
        <p>
          Stripe đã xác nhận thanh toán test thành công. Mình đã chuyển giỏ hàng hiện tại thành đơn hàng thật trong cơ sở dữ liệu.
        </p>
      </div>

      <section className="section-shell" style={{ marginTop: 28 }}>
        <div className="summary-list">
          <div className="summary-row"><span>Mã đơn</span><strong>{order.id}</strong></div>
          <div className="summary-row"><span>Stripe session</span><strong>{order.stripeSessionId}</strong></div>
          <div className="summary-row"><span>Khách hàng</span><strong>{order.customerName ?? "Khách test"}</strong></div>
          <div className="summary-row"><span>Email</span><strong>{order.customerEmail ?? "Không có"}</strong></div>
          <div className="summary-row total"><span>Tổng thanh toán</span><strong>{formatCurrency(order.total)}</strong></div>
        </div>
        <div className="inline-actions" style={{ marginTop: 20 }}>
          <Link className="cta-chip" href="/products">Tiếp tục mua sắm</Link>
          <Link className="filter-chip active" href="/cart">Xem giỏ hàng</Link>
        </div>
      </section>
    </div>
  );
}
