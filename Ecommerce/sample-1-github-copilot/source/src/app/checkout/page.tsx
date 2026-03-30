import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutContent from "./CheckoutContent";

export const metadata = {
  title: "Checkout | Shopee",
};

export default function CheckoutPage() {
  return (
    <>
      <Header variant="checkout" />

      {/* Checkout Progress Bar */}
      <div className="bg-surface-container-lowest shadow-sm mb-4">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center space-x-4 md:space-x-12">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">1</div>
              <span className="text-sm font-medium text-primary">Shipping</span>
            </div>
            <div className="h-[1px] w-8 md:w-24 bg-primary" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">2</div>
              <span className="text-sm font-bold text-primary">Payment</span>
            </div>
            <div className="h-[1px] w-8 md:w-24 bg-surface-container-highest" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center text-xs font-bold">3</div>
              <span className="text-sm font-medium text-on-surface-variant">Review</span>
            </div>
          </div>
        </div>
      </div>

      <CheckoutContent />
      <Footer />
    </>
  );
}
