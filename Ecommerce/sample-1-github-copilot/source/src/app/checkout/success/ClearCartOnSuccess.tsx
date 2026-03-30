"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart/context";

export default function ClearCartOnSuccess() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      clearCart();
    }
  }, [clearCart, searchParams]);

  return null;
}
