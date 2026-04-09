import { z } from "zod";

export const productCardSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  shortDescription: z.string(),
  category: z.string(),
  price: z.number(),
  compareAtPrice: z.number().nullable(),
  imageUrl: z.string().url(),
  inventoryLabel: z.string(),
});

export const productDetailSchema = productCardSchema.extend({
  description: z.string(),
  gallery: z.array(z.string().url()),
});

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  icon: z.string().nullable(),
});

export const cartItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  productSlug: z.string(),
  productName: z.string(),
  imageUrl: z.string().url(),
  quantity: z.number().int().positive(),
  unitPrice: z.number(),
  lineTotal: z.number(),
  inventoryLabel: z.string(),
});

export const cartSchema = z.object({
  id: z.string(),
  itemCount: z.number().int().nonnegative(),
  subtotal: z.number(),
  taxAmount: z.number(),
  totalAmount: z.number(),
  items: z.array(cartItemSchema),
});

export const orderItemSchema = z.object({
  id: z.string(),
  productName: z.string(),
  productSlug: z.string(),
  quantity: z.number().int(),
  totalPrice: z.number(),
});

export const orderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  status: z.string(),
  createdAt: z.string(),
  totalAmount: z.number(),
  paymentStatus: z.string(),
  items: z.array(orderItemSchema),
});

export const adminSummarySchema = z.object({
  revenue: z.number(),
  paidOrders: z.number().int(),
  activeProducts: z.number().int(),
  lowStockProducts: z.number().int(),
});

export const addToCartInputSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive().max(10).default(1),
});

export const updateCartInputSchema = z.object({
  itemId: z.string(),
  quantity: z.number().int().min(0).max(25),
});

export const adminProductInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3),
  slug: z.string().min(3),
  sku: z.string().min(3),
  categoryId: z.string(),
  shortDescription: z.string().min(8),
  description: z.string().min(24),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().nullable(),
  inventoryCount: z.number().int().nonnegative(),
  featured: z.boolean().default(false),
  imageUrl: z.string().url(),
});

export const checkoutResponseSchema = z.object({
  sessionId: z.string(),
  url: z.string().url(),
});

export const productSearchResponseSchema = z.object({
  items: z.array(productCardSchema),
  total: z.number().int().nonnegative(),
  nextOffset: z.number().int().nonnegative().nullable(),
  hasMore: z.boolean(),
});

export type ProductCard = z.infer<typeof productCardSchema>;
export type ProductDetail = z.infer<typeof productDetailSchema>;
export type CategoryDto = z.infer<typeof categorySchema>;
export type CartDto = z.infer<typeof cartSchema>;
export type OrderDto = z.infer<typeof orderSchema>;
export type AdminSummaryDto = z.infer<typeof adminSummarySchema>;
export type AdminProductInput = z.infer<typeof adminProductInputSchema>;
export type CheckoutResponse = z.infer<typeof checkoutResponseSchema>;
export type ProductSearchResponse = z.infer<typeof productSearchResponseSchema>;
