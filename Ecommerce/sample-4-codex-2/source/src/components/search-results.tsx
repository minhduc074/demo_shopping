"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { type Category, type Product } from "@prisma/client";
import { formatCurrency } from "@/lib/utils";

type ProductWithCategory = Product & { category: Category };

type SearchResponse = {
  items: ProductWithCategory[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export function SearchResults({
  category,
  initialResult,
  prevHref,
  query,
}: {
  category?: string;
  initialResult: SearchResponse;
  prevHref: string;
  query?: string;
}) {
  const [result, setResult] = useState(initialResult);
  const [pending, setPending] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (pending || !result.hasMore) {
      return;
    }

    setPending(true);

    const params = new URLSearchParams({
      page: String(result.page + 1),
      pageSize: String(result.pageSize),
    });

    if (query) {
      params.set("query", query);
    }

    if (category) {
      params.set("category", category);
    }

    const response = await fetch(`/api/products?${params.toString()}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      setPending(false);
      return;
    }

    const nextPage = (await response.json()) as SearchResponse;

    setResult((current) => ({
      ...nextPage,
      items: [...current.items, ...nextPage.items],
    }));
    setPending(false);
  }, [category, pending, query, result.hasMore, result.page, result.pageSize]);

  useEffect(() => {
    const target = sentinelRef.current;

    if (!target || !result.hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "320px 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [loadMore, result.hasMore]);

  const shownStart = (initialResult.page - 1) * initialResult.pageSize + 1;
  const shownEnd = Math.min(result.page * result.pageSize, result.total);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {result.items.map((product) => (
          <article className="group rounded-[1.75rem] bg-white p-4 shadow-[0_16px_40px_rgba(45,47,47,0.06)]" key={product.id}>
            <Link className="block" href={`/products/${product.slug}`}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-[--surface-low]">
                <Image alt={product.name} className="object-cover transition duration-500 group-hover:scale-[1.03]" fill src={product.imageUrl} />
              </div>
            </Link>
            <div className="pt-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[--primary]">{product.category.name}</p>
                <p className="text-xs text-[--muted]">{product.reviewCount} reviews</p>
              </div>
              <Link className="mt-2 block text-lg font-semibold tracking-[-0.02em] text-[--ink]" href={`/products/${product.slug}`}>
                {product.name}
              </Link>
              <p className="mt-2 text-sm leading-6 text-[--muted]">{product.description}</p>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xl font-bold text-[--ink]">{formatCurrency(product.priceCents)}</p>
                  {product.compareAtCents ? <p className="text-sm text-[--muted] line-through">{formatCurrency(product.compareAtCents)}</p> : null}
                </div>
                <span className="rounded-full bg-[--surface-low] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[--ink]">
                  {product.brand}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div ref={sentinelRef} />

      <div className="flex flex-col gap-4 rounded-[1.5rem] bg-white px-5 py-4 shadow-[0_16px_40px_rgba(45,47,47,0.06)] md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-[--muted]">
          Showing {shownStart}-{shownEnd} of {result.total} products
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            aria-disabled={initialResult.page === 1}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${initialResult.page === 1 ? "pointer-events-none bg-[--surface-low] text-[--muted]" : "bg-[--surface-low] text-[--ink]"}`}
            href={prevHref}
          >
            Previous
          </Link>
          <span className="text-sm font-medium text-[--ink]">Page {result.page}</span>
          <button
            className={`rounded-full px-4 py-2 text-sm font-semibold ${result.hasMore ? "signature-button" : "pointer-events-none bg-[--surface-low] text-[--muted]"}`}
            disabled={!result.hasMore || pending}
            onClick={() => void loadMore()}
            type="button"
          >
            {pending ? "Loading..." : result.hasMore ? "Load more" : "All loaded"}
          </button>
        </div>
      </div>
    </div>
  );
}
