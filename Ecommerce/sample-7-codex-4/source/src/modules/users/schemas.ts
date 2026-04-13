import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự."),
  phone: z.string().min(8, "Số điện thoại không hợp lệ.").optional().or(z.literal("")),
  avatarUrl: z.string().url("Ảnh đại diện phải là URL hợp lệ.").optional().or(z.literal("")),
});
