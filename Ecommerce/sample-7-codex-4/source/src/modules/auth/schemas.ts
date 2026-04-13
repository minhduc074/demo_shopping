import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự."),
  email: z.email("Email không hợp lệ."),
  phone: z.string().min(8, "Số điện thoại không hợp lệ.").optional().or(z.literal("")),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự."),
});

export const loginSchema = z.object({
  email: z.email("Email không hợp lệ."),
  password: z.string().min(1, "Vui lòng nhập mật khẩu."),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Email không hợp lệ."),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10, "Token không hợp lệ."),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự."),
});
