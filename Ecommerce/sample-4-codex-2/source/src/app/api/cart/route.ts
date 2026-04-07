import { getRequiredUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cartMutationSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getRequiredUser();
  const cart = await prisma.cart.findFirst({
    where: { userId: user.id },
    include: {
      user: true,
      items: {
        include: {
          product: {
            include: { category: true },
          },
        },
      },
    },
  });

  return NextResponse.json(cart);
}

export async function POST(request: Request) {
  const user = await getRequiredUser();
  const json = await request.json();
  const parsed = cartMutationSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid cart mutation." }, { status: 400 });
  }

  const cart = await prisma.cart.findFirst({
    where: { userId: user.id },
    include: { items: true },
  });

  if (!cart) {
    return NextResponse.json({ message: "Cart not found." }, { status: 404 });
  }

  const existing = cart.items.find((item) => item.productId === parsed.data.productId);

  if (existing) {
    const item = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + parsed.data.quantity },
    });

    return NextResponse.json({ message: "Cart item updated.", item });
  }

  const item = await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId: parsed.data.productId,
      quantity: parsed.data.quantity,
    },
  });

  return NextResponse.json({ message: "Item added to cart.", item }, { status: 201 });
}
