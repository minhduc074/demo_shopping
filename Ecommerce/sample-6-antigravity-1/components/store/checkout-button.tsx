"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CheckoutButton() {
  const [busy, setBusy] = useState(false);

  async function handleCheckout() {
    setBusy(true);
    try {
      const response = await fetch("/api/checkout/session", {
        method: "POST",
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Checkout session creation failed");
      }
    } catch (e) {
      alert("Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button disabled={busy} onClick={handleCheckout} className="w-full">
      {busy ? "Processing..." : "Pay with Stripe"}
    </Button>
  );
}
