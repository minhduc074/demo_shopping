"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { CartDto } from "@/lib/contracts";

type CartPanelProps = {
  initialCart: CartDto;
};

export function CartPanel({ initialCart }: CartPanelProps) {
  const [cart, setCart] = useState(initialCart);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);

  const empty = useMemo(() => cart.items.length === 0, [cart.items.length]);

  async function mutate(itemId: string, quantity: number) {
    setBusyItemId(itemId);
    try {
      const response = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity }),
      });
      if (response.ok) {
        setCart(await response.json());
      }
    } finally {
      setBusyItemId(null);
    }
  }

  if (empty) {
    return (
      <div className="surface-panel flex min-h-[320px] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-2xl font-semibold">Your cart is empty</h2>
        <p className="max-w-md text-sm leading-6 text-[var(--color-text-muted)]">
          Start from the curated homepage or search experience and build a basket with real DB-backed line items.
        </p>
        <Link className="rounded-[0.75rem] bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white" href="/search">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_0.8fr]">
      <div className="space-y-4">
        {cart.items.map((item) => (
          <div className="surface-panel flex flex-col gap-4 md:flex-row md:items-center" key={item.id}>
            <div className="relative aspect-square w-full max-w-[140px] overflow-hidden rounded-[0.9rem] bg-[var(--color-surface-low)]">
              <Image alt={item.productName} className="object-cover" fill sizes="140px" src={item.imageUrl} />
            </div>
            <div className="flex flex-1 flex-col gap-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link className="text-lg font-semibold" href={`/products/${item.productSlug}`}>
                    {item.productName}
                  </Link>
                  <p className="text-sm text-[var(--color-text-muted)]">{item.inventoryLabel}</p>
                </div>
                <p className="text-lg font-semibold">${item.lineTotal.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="icon-chip"
                  disabled={busyItemId === item.id}
                  onClick={() => mutate(item.id, Math.max(0, item.quantity - 1))}
                  type="button"
                >
                  -
                </button>
                <span className="text-sm font-semibold">{item.quantity}</span>
                <button
                  className="icon-chip"
                  disabled={busyItemId === item.id}
                  onClick={() => mutate(item.id, item.quantity + 1)}
                  type="button"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <aside className="surface-panel h-fit space-y-5">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-secondary)]">Summary</p>
          <h2 className="mt-2 text-2xl font-semibold">Cart totals</h2>
        </div>
        <dl className="space-y-3 text-sm text-[var(--color-text-muted)]">
          <div className="flex items-center justify-between">
            <dt>Subtotal</dt>
            <dd>${cart.subtotal.toFixed(2)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt>Estimated tax</dt>
            <dd>${cart.taxAmount.toFixed(2)}</dd>
          </div>
          <div className="flex items-center justify-between border-t border-[rgba(172,173,173,0.2)] pt-3 text-base font-semibold text-[var(--color-text)]">
            <dt>Total</dt>
            <dd>${cart.totalAmount.toFixed(2)}</dd>
          </div>
        </dl>
        <Link className="block rounded-[0.75rem] bg-[var(--color-primary)] px-5 py-3 text-center text-sm font-semibold text-white hover:bg-[var(--color-primary-soft)] transition" href="/checkout">
          Continue to Checkout
        </Link>
      </aside>
    </div>
  );
}
