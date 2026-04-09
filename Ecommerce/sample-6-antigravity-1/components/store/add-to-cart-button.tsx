"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function AddToCartButton({ productId }: { productId: string }) {
  const [busy, setBusy] = useState(false);

  async function handleAdd() {
    setBusy(true);
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      alert("Added to cart!");
    } catch {
      alert("Failed to add to cart");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button disabled={busy} onClick={handleAdd} className="w-full h-12 text-base">
      {busy ? "Adding..." : "Add to Cart"}
    </Button>
  );
}
