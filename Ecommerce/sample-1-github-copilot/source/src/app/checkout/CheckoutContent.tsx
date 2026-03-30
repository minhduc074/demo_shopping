"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart/context";

export default function CheckoutContent() {
  const { items } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [voucherCode, setVoucherCode] = useState("");
  const [loading, setLoading] = useState(false);

  const orderItems = items.map(({ product, quantity }) => ({
    id: product.id,
    name: product.name,
    variation: product.category ?? "Standard",
    price: Number(product.price),
    quantity,
    image: product.image_url,
  }));

  const subtotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = 5.5;
  const discount = 10.0;
  const total = subtotal + shipping - discount;

  async function handlePlaceOrder() {
    if (orderItems.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems.map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <main className="max-w-7xl mx-auto px-4 pb-24 lg:flex lg:gap-6">
      <div className="flex-1 space-y-4">
        {/* Shipping Address */}
        <section className="bg-surface-container-lowest p-6 shadow-sm border-t-4 border-primary">
          <div className="flex items-center gap-2 text-primary mb-4">
            <span className="material-symbols-outlined">location_on</span>
            <h2 className="text-lg font-bold tracking-tight">Delivery Address</h2>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="font-bold text-on-surface">John Doe (+63) 912 345 6789</div>
              <div className="text-sm text-on-surface-variant mt-1">
                123 Maginhawa Street, Brgy. Central, Quezon City, Metro Manila, 1101
              </div>
            </div>
            <button className="text-primary text-sm font-bold hover:underline">Change</button>
          </div>
        </section>

        {/* Order List */}
        <section className="bg-surface-container-lowest p-6 shadow-sm">
          <div className="grid grid-cols-12 text-sm text-on-surface-variant pb-4 border-b border-surface-container">
            <div className="col-span-6 md:col-span-7 font-bold text-on-surface">Products Ordered</div>
            <div className="hidden md:block col-span-2 text-center">Unit Price</div>
            <div className="hidden md:block col-span-1 text-center">Amount</div>
            <div className="col-span-6 md:col-span-2 text-right">Item Subtotal</div>
          </div>
          {orderItems.length === 0 ? (
            <div className="py-8 text-sm text-on-surface-variant text-center">Your cart is empty.</div>
          ) : (
            orderItems.map((item) => (
              <div key={item.id} className="grid grid-cols-12 py-6 items-center border-b border-surface-container-low last:border-b-0">
                <div className="col-span-12 md:col-span-7 flex gap-4">
                  <div className="w-20 h-20 relative flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover rounded-sm" sizes="80px" unoptimized />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="text-sm font-medium line-clamp-2">{item.name}</h3>
                    <span className="text-xs text-on-surface-variant mt-1">Variation: {item.variation}</span>
                  </div>
                </div>
                <div className="hidden md:flex col-span-2 justify-center items-center text-sm">${item.price.toFixed(2)}</div>
                <div className="hidden md:flex col-span-1 justify-center items-center text-sm">{item.quantity}</div>
                <div className="col-span-12 md:col-span-2 text-right text-sm font-bold md:font-normal mt-2 md:mt-0">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </section>

        {/* Payment Method */}
        <section className="bg-surface-container-lowest p-6 shadow-sm">
          <h2 className="text-lg font-bold tracking-tight mb-6">Payment Method</h2>
          <div className="flex flex-wrap gap-3 mb-8">
            {[
              { key: "card", label: "Credit / Debit Card" },
              { key: "cod", label: "Cash on Delivery" },
              { key: "shopeepay", label: "ShopeePay" },
              { key: "banking", label: "Online Banking" },
            ].map((m) => (
              <button
                key={m.key}
                onClick={() => setPaymentMethod(m.key)}
                className={`px-4 py-2 text-sm transition-colors ${
                  paymentMethod === m.key
                    ? "border-2 border-primary text-primary font-bold"
                    : "border border-surface-container-high text-on-surface-variant hover:border-primary"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {paymentMethod === "card" && (
            <div className="bg-surface-container-low p-6 rounded-sm">
              <div className="flex items-center gap-4 mb-6">
                <span className="material-symbols-outlined text-primary">credit_card</span>
                <span className="text-sm font-bold">Add New Card</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">CARD NUMBER</label>
                  <input
                    className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-sm py-2 px-3 text-sm focus:ring-primary focus:border-primary focus:outline-none"
                    placeholder="XXXX XXXX XXXX XXXX"
                    type="text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">EXPIRY DATE</label>
                  <input
                    className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-sm py-2 px-3 text-sm focus:ring-primary focus:border-primary focus:outline-none"
                    placeholder="MM/YY"
                    type="text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">CVV</label>
                  <input
                    className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-sm py-2 px-3 text-sm focus:ring-primary focus:border-primary focus:outline-none"
                    placeholder="***"
                    type="password"
                  />
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Sidebar */}
      <aside className="lg:w-96 mt-6 lg:mt-0 space-y-4">
        {/* Voucher */}
        <section className="bg-surface-container-lowest p-6 shadow-sm border-l-4 border-tertiary">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-tertiary">confirmation_number</span>
            <h3 className="font-bold">Shopee Voucher</h3>
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 bg-surface border-none text-sm py-2 px-3 focus:ring-1 focus:ring-tertiary focus:outline-none"
              placeholder="Enter Voucher Code"
              type="text"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
            />
            <button className="bg-tertiary text-white px-4 py-2 text-sm font-bold hover:bg-tertiary-dim transition-colors">
              Apply
            </button>
          </div>
        </section>

        {/* Order Summary */}
        <section className="bg-surface-container-lowest p-6 shadow-sm sticky top-20">
          <h2 className="text-lg font-bold mb-6 tracking-tight">Order Summary</h2>
          <div className="space-y-3 text-sm border-b border-surface-container-low pb-6">
            <div className="flex justify-between text-on-surface-variant">
              <span>Merchandise Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Shipping Total</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Voucher Discount</span>
              <span className="text-primary">-${discount.toFixed(2)}</span>
            </div>
          </div>
          <div className="py-6 space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-sm font-medium">Total Payment</span>
              <span className="text-2xl font-bold text-primary tracking-tight">${total.toFixed(2)}</span>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={loading || orderItems.length === 0}
              className="w-full bg-primary hover:bg-secondary-dim text-white py-4 font-bold text-lg shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
          </div>
          <div className="flex flex-col items-center gap-4 pt-4 border-t border-surface-container-low">
            <div className="flex items-center gap-2 text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">
              <span className="material-symbols-outlined text-green-600" style={{ fontSize: 16 }}>
                verified_user
              </span>
              Secure Checkout Guaranteed
            </div>
          </div>
        </section>
      </aside>
    </main>
  );
}
