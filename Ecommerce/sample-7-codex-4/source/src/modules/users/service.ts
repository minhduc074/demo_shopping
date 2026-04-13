import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { addresses, orderItems, orders, users } from "@/lib/db/schema";
import { updateProfileSchema } from "@/modules/users/schemas";

export async function updateProfile(userId: string, input: unknown) {
  const data = updateProfileSchema.parse(input);

  await db
    .update(users)
    .set({
      fullName: data.fullName,
      phone: data.phone || null,
      avatarUrl: data.avatarUrl || null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

export async function getProfile(userId: string) {
  const [profile] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const userAddresses = await db.select().from(addresses).where(eq(addresses.userId, userId)).orderBy(desc(addresses.isDefault), desc(addresses.createdAt));
  return { profile, userAddresses };
}

export async function getUserOrders(userId: string) {
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function getUserOrderDetail(userId: string, orderId: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order || order.userId !== userId) {
    return null;
  }

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return { order, items };
}
