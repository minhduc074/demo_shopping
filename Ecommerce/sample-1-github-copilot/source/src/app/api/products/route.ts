import { NextRequest, NextResponse } from "next/server";
import { getDailyProducts } from "@/lib/db/products";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "12");

  const products = await getDailyProducts(limit, page);
  return NextResponse.json(products);
}
