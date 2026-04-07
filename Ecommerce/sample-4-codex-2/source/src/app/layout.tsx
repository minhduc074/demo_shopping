import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppFooter, AppHeader } from "@/components/commerce";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "The Curator Commerce",
  description: "Modern ecommerce demo powered by Next.js 14, Prisma, PostgreSQL, and Stitch assets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} bg-[--surface] font-sans text-[--ink] antialiased`}>
        <AppHeader />
        <main className="min-h-[calc(100vh-168px)]">{children}</main>
        <AppFooter />
      </body>
    </html>
  );
}
