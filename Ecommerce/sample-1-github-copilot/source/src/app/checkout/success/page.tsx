import { Suspense } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClearCartOnSuccess from "./ClearCartOnSuccess";

export const metadata = {
  title: "Order Confirmed | Shopee",
};

export default function CheckoutSuccessPage() {
  return (
    <>
      <Suspense fallback={null}><ClearCartOnSuccess /></Suspense>
      <Header variant="checkout" />
      <main className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="bg-surface-container-lowest p-12 shadow-sm rounded-sm">
          <span className="material-symbols-outlined text-green-600 mb-4" style={{ fontSize: 64 }}>
            check_circle
          </span>
          <h1 className="text-2xl font-bold text-on-surface mb-4">Order Placed Successfully!</h1>
          <p className="text-on-surface-variant mb-8">
            Thank you for your purchase. Your order has been confirmed and will be shipped soon.
          </p>
          <Link
            href="/"
            className="inline-block bg-primary text-white px-8 py-3 font-bold hover:bg-secondary-dim transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
