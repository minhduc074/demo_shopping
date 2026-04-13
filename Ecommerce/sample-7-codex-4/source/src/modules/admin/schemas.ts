import { z } from "zod";

export const productUpsertSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().min(2, "Tên sản phẩm không hợp lệ."),
  slug: z.string().min(2, "Slug không hợp lệ."),
  categoryId: z.uuid().optional().nullable(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  brand: z.string().optional(),
  status: z.enum(["active", "draft", "archived"]),
  basePrice: z.coerce.number().min(0, "Giá phải lớn hơn hoặc bằng 0."),
  compareAtPrice: z.coerce.number().min(0).optional().nullable(),
  currency: z.string().default("VND"),
  thumbnailUrl: z.string().url("Ảnh đại diện phải là URL hợp lệ.").optional().or(z.literal("")),
  isFeatured: z.coerce.boolean().default(false),
});
