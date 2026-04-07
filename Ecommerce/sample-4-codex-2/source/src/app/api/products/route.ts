import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { searchProducts } from "@/lib/store";
import { createProductSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "24");
  const query = searchParams.get("query") ?? undefined;
  const category = searchParams.get("category") ?? undefined;

  const products = await searchProducts({
    query,
    category,
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 24,
  });

  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = createProductSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid product payload.", errors: parsed.error.flatten() }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: parsed.data,
    include: { category: true },
  });

  return NextResponse.json({ message: `${product.name} created successfully.`, product }, { status: 201 });
}
