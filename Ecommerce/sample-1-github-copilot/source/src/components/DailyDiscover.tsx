"use client";

import { useState, useCallback } from "react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/db/products";

export default function DailyDiscover({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?page=${page}&limit=12`);
      const newProducts: Product[] = await res.json();
      if (newProducts.length < 12) setHasMore(false);
      setProducts((prev) => [...prev, ...newProducts]);
      setPage((prev) => prev + 1);
    } catch {
      // ignore network errors
    } finally {
      setLoading(false);
    }
  }, [page]);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="bg-white border border-outline-variant text-on-surface-variant px-12 py-3 rounded-sm hover:bg-surface-container-low transition-colors font-medium disabled:opacity-50"
          >
            {loading ? "Loading..." : "See More"}
          </button>
        </div>
      )}
    </>
  );
}
