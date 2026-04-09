import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserProfile } from "@/lib/auth";
import { addCartItem, updateCartItem, getCartForUser } from "@/lib/data";

export async function GET() {
  try {
    const profile = await getCurrentUserProfile();
    if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const cart = await getCartForUser(profile.id);
    return NextResponse.json(cart);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const profile = await getCurrentUserProfile();
    if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { productId, quantity } = await req.json();
    const cart = await addCartItem(profile.id, productId, quantity || 1);
    return NextResponse.json(cart);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const profile = await getCurrentUserProfile();
    if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { itemId, quantity } = await req.json();
    const cart = await updateCartItem(profile.id, itemId, quantity);
    return NextResponse.json(cart);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
