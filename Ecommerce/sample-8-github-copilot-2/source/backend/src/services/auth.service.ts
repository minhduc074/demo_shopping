import { prisma } from "../lib/prisma";
import { hashPassword, comparePassword } from "../lib/password";
import { signToken } from "../lib/jwt";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export const AuthService = {
  async register(data: unknown) {
    const parsed = registerSchema.parse(data);

    const existing = await prisma.user.findUnique({
      where: { email: parsed.email },
    });
    if (existing) {
      const err = new Error("Email này đã được đăng ký") as Error & { statusCode: number };
      err.statusCode = 409;
      throw err;
    }

    const passwordHash = await hashPassword(parsed.password);
    const user = await prisma.user.create({
      data: {
        email: parsed.email,
        fullName: parsed.fullName,
        phone: parsed.phone,
        passwordHash,
      },
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    return { user: sanitizeUser(user), token };
  },

  async login(data: unknown) {
    const parsed = loginSchema.parse(data);

    const user = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (!user) {
      const err = new Error("Email hoặc mật khẩu không đúng") as Error & { statusCode: number };
      err.statusCode = 401;
      throw err;
    }

    const match = await comparePassword(parsed.password, user.passwordHash);
    if (!match) {
      const err = new Error("Email hoặc mật khẩu không đúng") as Error & { statusCode: number };
      err.statusCode = 401;
      throw err;
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    return { user: sanitizeUser(user), token };
  },

  async getUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const err = new Error("Không tìm thấy người dùng") as Error & { statusCode: number };
      err.statusCode = 404;
      throw err;
    }
    return sanitizeUser(user);
  },

  async updateUser(userId: string, data: { fullName?: string; phone?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.fullName && { fullName: data.fullName }),
        ...(data.phone && { phone: data.phone }),
      },
    });
    return sanitizeUser(user);
  },
};

function sanitizeUser(user: { id: string; email: string; fullName: string; phone: string | null; role: string; createdAt: Date }) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
  };
}
