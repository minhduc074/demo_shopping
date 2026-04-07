import { OrderCard, PageIntro } from "@/components/commerce";
import { getOrders } from "@/lib/store";

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div className="content-shell space-y-10">
      <PageIntro description="Customer orders are rendered from relational order, item, and product tables." eyebrow="My Orders" title="Your purchase history" />
      <div className="grid gap-6">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}

