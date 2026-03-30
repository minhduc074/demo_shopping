"use client";

import Image from "next/image";
import type { Product } from "@/lib/db/products";
import { useCart } from "@/lib/cart/context";

function formatSold(count: number): string {
  if (count >= 1000) return `Sold ${(count / 1000).toFixed(1)}k`;
  return `Sold ${count}`;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <div className="product-card bg-white rounded shadow-sm overflow-hidden flex flex-col relative group cursor-pointer hover:shadow-md transition-shadow">
      <div className="aspect-square relative overflow-hidden bg-surface-container-low">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
          unoptimized
        />
        {product.discount_percent && product.discount_percent > 0 && (
          <div className="absolute top-0 right-0 bg-primary-container text-on-primary-container text-[10px] font-bold px-2 py-1">
            -{product.discount_percent}%
          </div>
        )}
        {product.is_mall && (
          <div className="absolute top-0 left-0 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold px-2 py-1">
            Mall
          </div>
        )}
        {product.is_new && !product.is_mall && (
          <div className="absolute top-0 left-0 bg-secondary-container text-on-secondary-container text-[10px] font-bold px-2 py-1">
            New
          </div>
        )}
      </div>
      <div className="p-2 flex flex-col flex-1">
        <h3 className="text-xs line-clamp-2 mb-2 text-on-surface leading-snug">
          {product.name}
        </h3>
        <div className="mt-auto">
          <div className="flex items-center justify-between">
            <span className="text-primary font-bold text-base">
              ${Number(product.price).toFixed(2)}
            </span>
            <span className="text-[10px] text-outline">{formatSold(product.sold_count)}</span>
          </div>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          addToCart(product);
        }}
        className="absolute inset-x-0 bottom-0 bg-primary text-white py-2 font-bold text-xs opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-full transition-all duration-200"
      >
        ADD TO CART
      </button>
    </div>
  );
}
