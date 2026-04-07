import Image from "next/image";
import Link from "next/link";
import { CartItemDeleteButton } from "@/components/forms";
import { EmptyState, PageIntro } from "@/components/commerce";
import { getCart } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

export default async function CartPage() {
  const cart = await getCart();

  if (!cart || cart.items.length === 0) {
    return (
      <div className="content-shell">
        <EmptyState action={<Link className="signature-button" href="/search">Browse products</Link>} copy="The cart table is wired to Prisma, but there are no persisted cart items yet." title="Your cart is empty" />
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.quantity * item.product.priceCents, 0);
  const shipping = 1200;
  const total = subtotal + shipping;

  return (
    <div className="content-shell space-y-10">
      <PageIntro description="Cart contents are loaded directly from PostgreSQL through Prisma relations." eyebrow="Shopping Cart" title={`${cart.user?.name ?? "Guest"}'s bag`} />
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
        <section className="space-y-4">
          {cart.items.map((item) => (
            <article className="flex gap-4 rounded-[1.75rem] bg-white p-4 shadow-[0_16px_40px_rgba(45,47,47,0.06)]" key={item.id}>
              <div className="relative aspect-square w-28 overflow-hidden rounded-[1.25rem] bg-[--surface-low]">
                <Image alt={item.product.name} className="object-cover" fill src={item.product.imageUrl} />
              </div>
              <div className="flex flex-1 flex-col justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[--primary]">{item.product.category.name}</p>
                  <h2 className="mt-1 text-xl font-bold text-[--ink]">{item.product.name}</h2>
                  <p className="mt-2 text-sm text-[--muted]">{item.product.brand}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-[--muted]">Qty {item.quantity}</p>
                    <CartItemDeleteButton itemId={item.id} />
                  </div>
                  <p className="text-lg font-semibold text-[--ink]">{formatCurrency(item.quantity * item.product.priceCents)}</p>
                </div>
              </div>
            </article>
          ))}
        </section>
        <aside className="rounded-[1.75rem] bg-white p-6 shadow-[0_16px_40px_rgba(45,47,47,0.06)]">
          <h2 className="text-xl font-bold text-[--ink]">Order summary</h2>
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between text-[--muted]"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between text-[--muted]"><span>Shipping</span><span>{formatCurrency(shipping)}</span></div>
            <div className="flex justify-between border-t border-black/5 pt-4 text-lg font-bold text-[--ink]"><span>Total</span><span>{formatCurrency(total)}</span></div>
          </div>
          <Link className="signature-button mt-6 w-full justify-center" href="/checkout">
            Continue to checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}
