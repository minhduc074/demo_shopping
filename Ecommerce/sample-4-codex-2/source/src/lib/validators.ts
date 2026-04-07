import { z } from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
});

export const createProductSchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3),
  brand: z.string().min(2),
  description: z.string().min(10),
  categoryId: z.string().min(1),
  imageUrl: z.string().min(1),
  priceCents: z.number().int().nonnegative(),
  compareAtCents: z.number().int().nonnegative().nullable().optional(),
  inventory: z.number().int().nonnegative(),
  featured: z.boolean().optional(),
  tags: z.array(z.string()).default([]),
  details: z.array(z.string()).default([]),
});

export const cartMutationSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(10),
});

export const cartItemPatchSchema = z.object({
  quantity: z.number().int().min(1).max(10),
});

export const orderSchema = z.object({
  shippingName: z.string().min(2),
  shippingEmail: z.email(),
  addressLine1: z.string().min(4),
  city: z.string().min(2),
  country: z.string().min(2),
  notes: z.string().max(280).optional(),
});
