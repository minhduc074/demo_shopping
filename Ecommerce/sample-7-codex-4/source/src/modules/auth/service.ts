import crypto from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { passwordResetTokens, users } from "@/lib/db/schema";
import { AppError } from "@/lib/errors";
import { sendPasswordResetEmail } from "@/lib/mail";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from "@/modules/auth/schemas";

function hashResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function registerUser(input: unknown) {
  const data = registerSchema.parse(input);
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, data.email)).limit(1);

  if (existing[0]) {
    throw new AppError("Email đã tồn tại trong hệ thống.", 409);
  }

  const passwordHash = await hashPassword(data.password);
  const created = await db
    .insert(users)
    .values({
      email: data.email,
      phone: data.phone || null,
      fullName: data.fullName,
      passwordHash,
    })
    .returning({ id: users.id });

  await createSession(created[0].id);
}

export async function loginUser(input: unknown) {
  const data = loginSchema.parse(input);
  const found = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
  const user = found[0];

  if (!user) {
    throw new AppError("Email hoặc mật khẩu không đúng.", 401);
  }

  const matches = await verifyPassword(data.password, user.passwordHash);

  if (!matches) {
    throw new AppError("Email hoặc mật khẩu không đúng.", 401);
  }

  await createSession(user.id);
}

export async function logoutUser() {
  await destroySession();
}

export async function requestPasswordReset(input: unknown) {
  const data = forgotPasswordSchema.parse(input);
  const found = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
  const user = found[0];

  if (!user) {
    return;
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(rawToken);

  await db.insert(passwordResetTokens).values({
    userId: user.id,
    tokenHash,
    expiresAt: new Date(Date.now() + 1000 * 60 * 30),
  });

  await sendPasswordResetEmail(user.email, rawToken, user.fullName);
}

export async function resetPassword(input: unknown) {
  const data = resetPasswordSchema.parse(input);
  const tokenHash = hashResetToken(data.token);

  const found = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        gt(passwordResetTokens.expiresAt, new Date()),
        isNull(passwordResetTokens.usedAt),
      ),
    )
    .limit(1);

  const tokenRow = found[0];

  if (!tokenRow) {
    throw new AppError("Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ.", 400);
  }

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({
        passwordHash: await hashPassword(data.password),
        updatedAt: new Date(),
      })
      .where(eq(users.id, tokenRow.userId));

    await tx
      .update(passwordResetTokens)
      .set({
        usedAt: new Date(),
      })
      .where(eq(passwordResetTokens.id, tokenRow.id));
  });
}
