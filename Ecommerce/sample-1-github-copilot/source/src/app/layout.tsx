import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart/context";
import CartDrawer from "@/components/CartDrawer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Shopee | Shop Online for Electronics, Fashion & More",
  description:
    "The leading e-commerce platform in Southeast Asia. Shop for everything you need at amazing prices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <CartProvider>
          <CartDrawer />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
