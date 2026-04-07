"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { type Category } from "@prisma/client";

type AuthMode = "login" | "register";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const payload =
      mode === "login"
        ? {
            email: formData.get("email"),
            password: formData.get("password"),
          }
        : {
            name: formData.get("name"),
            email: formData.get("email"),
            password: formData.get("password"),
          };

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as { message?: string; redirectTo?: string };

    startTransition(() => {
      setMessage(result.message ?? (response.ok ? "Success" : "Request failed"));
      setPending(false);
      if (response.ok && result.redirectTo) {
        router.push(result.redirectTo);
        router.refresh();
      }
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {mode === "register" ? (
        <input className="w-full rounded-2xl bg-[--surface-low] px-4 py-3 outline-none ring-1 ring-transparent focus:ring-[--primary]" name="name" placeholder="Full name" required />
      ) : null}
      <input className="w-full rounded-2xl bg-[--surface-low] px-4 py-3 outline-none ring-1 ring-transparent focus:ring-[--primary]" name="email" placeholder="Email address" required type="email" />
      <input className="w-full rounded-2xl bg-[--surface-low] px-4 py-3 outline-none ring-1 ring-transparent focus:ring-[--primary]" name="password" placeholder="Password" required type="password" />
      <button className="signature-button w-full disabled:opacity-60" disabled={pending} type="submit">
        {pending ? "Submitting..." : mode === "login" ? "Sign In" : "Create Account"}
      </button>
      {message ? <p className="text-sm text-[--muted]">{message}</p> : null}
    </form>
  );
}

export function CartItemDeleteButton({ itemId }: { itemId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    setPending(true);
    await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
    router.refresh();
    setPending(false);
  }

  return (
    <button className="text-sm font-medium text-[--primary] disabled:opacity-60" disabled={pending} onClick={handleDelete} type="button">
      {pending ? "Removing..." : "Remove"}
    </button>
  );
}

export function CheckoutButton() {
  const [pending, setPending] = useState(false);

  async function handleCheckout() {
    setPending(true);
    const response = await fetch("/api/checkout/session", { method: "POST" });
    const result = (await response.json()) as { url?: string; message?: string };

    if (response.ok && result.url) {
      window.location.href = result.url;
      return;
    }

    setPending(false);
    window.alert(result.message ?? "Unable to create Stripe checkout session.");
  }

  return (
    <button className="signature-button mt-6 w-full justify-center disabled:opacity-60" disabled={pending} onClick={handleCheckout} type="button">
      {pending ? "Redirecting..." : "Pay with Stripe"}
    </button>
  );
}

export function AddToCartButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleAddToCart() {
    setPending(true);
    setMessage(null);

    const response = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 }),
    });

    const result = (await response.json()) as { message?: string };

    setPending(false);
    setMessage(result.message ?? (response.ok ? "Added to cart." : "Unable to add to cart."));

    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button className="signature-button disabled:opacity-60" disabled={pending} onClick={handleAddToCart} type="button">
        {pending ? "Adding..." : "Add to cart"}
      </button>
      {message ? <p className="text-sm text-[--muted]">{message}</p> : null}
    </div>
  );
}

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button className="rounded-full bg-[--surface-low] px-4 py-2 font-medium text-[--ink] disabled:opacity-60" disabled={pending} onClick={handleLogout} type="button">
      {pending ? "Signing out..." : "Sign out"}
    </button>
  );
}

export function ProductCreateForm({ categories }: { categories: Category[] }) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const tags = String(formData.get("tags") ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    const details = String(formData.get("details") ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    const payload = {
      name: String(formData.get("name")),
      slug: String(formData.get("slug")),
      brand: String(formData.get("brand")),
      description: String(formData.get("description")),
      categoryId: String(formData.get("categoryId")),
      imageUrl: String(formData.get("imageUrl")),
      priceCents: Number(formData.get("priceCents")),
      compareAtCents: Number(formData.get("compareAtCents") || 0) || null,
      inventory: Number(formData.get("inventory")),
      featured: formData.get("featured") === "on",
      tags,
      details,
    };

    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as { message?: string };

    startTransition(() => {
      setPending(false);
      setMessage(result.message ?? (response.ok ? "Product created." : "Failed to create product."));
      if (response.ok) {
        event.currentTarget.reset();
      }
    });
  }

  return (
    <form className="grid gap-3 rounded-[1.75rem] bg-white p-6 shadow-[0_16px_40px_rgba(45,47,47,0.06)] md:grid-cols-2" onSubmit={handleSubmit}>
      <input className="rounded-2xl bg-[--surface-low] px-4 py-3 outline-none ring-1 ring-transparent focus:ring-[--primary]" name="name" placeholder="Product name" required />
      <input className="rounded-2xl bg-[--surface-low] px-4 py-3 outline-none ring-1 ring-transparent focus:ring-[--primary]" name="slug" placeholder="product-slug" required />
      <input className="rounded-2xl bg-[--surface-low] px-4 py-3 outline-none ring-1 ring-transparent focus:ring-[--primary]" name="brand" placeholder="Brand" required />
      <select className="rounded-2xl bg-[--surface-low] px-4 py-3 outline-none ring-1 ring-transparent focus:ring-[--primary]" name="categoryId" required>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <input className="rounded-2xl bg-[--surface-low] px-4 py-3 outline-none ring-1 ring-transparent focus:ring-[--primary] md:col-span-2" defaultValue="/stitch/assets/asset-01.jpg" name="imageUrl" placeholder="Image URL" required />
      <textarea className="min-h-28 rounded-[1.5rem] bg-[--surface-low] px-4 py-3 outline-none ring-1 ring-transparent focus:ring-[--primary] md:col-span-2" name="description" placeholder="Description" required />
      <input className="rounded-2xl bg-[--surface-low] px-4 py-3 outline-none ring-1 ring-transparent focus:ring-[--primary]" name="priceCents" placeholder="Price in cents" required type="number" />
      <input className="rounded-2xl bg-[--surface-low] px-4 py-3 outline-none ring-1 ring-transparent focus:ring-[--primary]" name="compareAtCents" placeholder="Compare at cents" type="number" />
      <input className="rounded-2xl bg-[--surface-low] px-4 py-3 outline-none ring-1 ring-transparent focus:ring-[--primary]" name="inventory" placeholder="Inventory" required type="number" />
      <input className="rounded-2xl bg-[--surface-low] px-4 py-3 outline-none ring-1 ring-transparent focus:ring-[--primary]" name="tags" placeholder="Tags,comma,separated" />
      <input className="rounded-2xl bg-[--surface-low] px-4 py-3 outline-none ring-1 ring-transparent focus:ring-[--primary] md:col-span-2" name="details" placeholder="Details,comma,separated" />
      <label className="flex items-center gap-2 text-sm text-[--muted]">
        <input name="featured" type="checkbox" />
        Featured product
      </label>
      <button className="signature-button justify-center disabled:opacity-60" disabled={pending} type="submit">
        {pending ? "Saving..." : "Create Product"}
      </button>
      {message ? <p className="text-sm text-[--muted] md:col-span-2">{message}</p> : null}
    </form>
  );
}
