"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function AdminProductManager({ categories, initialProducts }: any) {
  return (
    <div className="surface-panel overflow-hidden">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-secondary)]">Inventory</p>
          <h2 className="mt-2 text-2xl font-semibold">{initialProducts.length} products</h2>
        </div>
      </div>
      <div className="space-y-3">
        {initialProducts.map((product: any) => (
          <div className="rounded-[0.9rem] bg-[var(--color-surface-low)] p-4" key={product.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {product.categoryName} · SKU {product.sku}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
