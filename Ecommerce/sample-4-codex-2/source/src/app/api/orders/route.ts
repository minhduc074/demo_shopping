import { getRequiredUser } from "@/lib/auth";
import { createOrderFromCart } from "@/lib/orders";
import { NextResponse } from "next/server";
import { orderSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: { product: true },
      },
      user: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const user = await getRequiredUser();
  const json = await request.json();
  const parsed = orderSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid order payload." }, { status: 400 });
  }

  try {
    const order = await createOrderFromCart({
      userId: user.id,
      shippingName: parsed.data.shippingName,
      shippingEmail: parsed.data.shippingEmail,
      addressLine1: parsed.data.addressLine1,
      city: parsed.data.city,
      country: parsed.data.country,
      notes: parsed.data.notes,
    });

    return NextResponse.json({ message: `Order ${order.orderNumber} created.`, order }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to create order." },
      { status: 400 },
    );
  }
}
