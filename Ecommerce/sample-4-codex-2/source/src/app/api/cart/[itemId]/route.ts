import { getRequiredUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cartItemPatchSchema } from "@/lib/validators";

export async function PATCH(request: Request, { params }: { params: { itemId: string } }) {
  const user = await getRequiredUser();
  const json = await request.json();
  const parsed = cartItemPatchSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid cart item update." }, { status: 400 });
  }

  const existingItem = await prisma.cartItem.findFirst({
    where: {
      id: params.itemId,
      cart: { userId: user.id },
    },
  });

  if (!existingItem) {
    return NextResponse.json({ message: "Cart item not found." }, { status: 404 });
  }

  const item = await prisma.cartItem.update({
    where: { id: existingItem.id },
    data: { quantity: parsed.data.quantity },
  });

  return NextResponse.json({ message: "Cart item quantity updated.", item });
}

export async function DELETE(_: Request, { params }: { params: { itemId: string } }) {
  const user = await getRequiredUser();

  await prisma.cartItem.deleteMany({
    where: {
      id: params.itemId,
      cart: { userId: user.id },
    },
  });

  return NextResponse.json({ message: "Cart item removed." });
}
