"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart/context";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeFromCart, updateQuantity, total, count } = useCart();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[380px] max-w-full bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <h2 className="font-bold text-lg text-on-surface">
            Cart ({count})
          </h2>
          <button
            onClick={closeCart}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-outline-variant">
              <span className="material-symbols-outlined text-6xl">shopping_cart</span>
              <p className="text-sm">Your cart is empty</p>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div key={product.id} className="flex gap-3 items-start">
                <div className="relative w-16 h-16 flex-shrink-0 bg-surface-container-low rounded overflow-hidden">
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-on-surface line-clamp-2 leading-snug mb-1">
                    {product.name}
                  </p>
                  <p className="text-primary font-bold text-sm">
                    ${Number(product.price).toFixed(2)}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-6 h-6 border border-outline-variant rounded flex items-center justify-center text-sm hover:bg-surface-container-low"
                    >
                      −
                    </button>
                    <span className="text-sm w-6 text-center">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="w-6 h-6 border border-outline-variant rounded flex items-center justify-center text-sm hover:bg-surface-container-low"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(product.id)}
                  className="text-outline-variant hover:text-error transition-colors mt-0.5"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t px-4 py-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-on-surface-variant">Subtotal</span>
              <span className="font-bold text-on-surface text-lg">
                ${total.toFixed(2)}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full bg-shopee hover:bg-primary text-white font-bold py-3 rounded text-center transition-colors"
            >
              Checkout ({count} items)
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
