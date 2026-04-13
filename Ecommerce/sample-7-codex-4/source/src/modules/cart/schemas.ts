import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.uuid(),
  variantId: z.uuid().optional().nullable(),
  quantity: z.coerce.number().int().min(1).max(99),
});

export const updateCartItemSchema = z.object({
  itemId: z.uuid(),
  quantity: z.coerce.number().int().min(1).max(99),
});

export const removeCartItemSchema = z.object({
  itemId: z.uuid(),
});
