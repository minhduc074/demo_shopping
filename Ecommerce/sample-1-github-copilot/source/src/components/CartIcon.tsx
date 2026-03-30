"use client";

import { useCart } from "@/lib/cart/context";

export default function CartIcon() {
  const { count, openCart } = useCart();

  return (
    <button onClick={openCart} className="relative cursor-pointer">
      <span className="material-symbols-outlined text-3xl">shopping_cart</span>
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-white text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-primary">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
