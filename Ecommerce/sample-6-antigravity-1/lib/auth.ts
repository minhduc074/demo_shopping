import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { createSalt, hashPassword, verifyPassword } from "@/lib/password";
import { createSession, destroySession, getSession } from "@/lib/session";

export async function getCurrentUserProfile() {
  const session = await getSession();
  if (!session) {
    return null;
  }

  return prisma.userProfile.findUnique({
    where: { id: session.userId },
  });
}

export async function requireSignedInProfile() {
  const profile = await getCurrentUserProfile();
  if (!profile) {
    redirect("/login");
  }
  return profile;
}

export async function requireAdminProfile() {
  const profile = await requireSignedInProfile();
  if (profile.role !== UserRole.ADMIN) {
    redirect("/");
  }
  return profile;
}

export async function registerWithPassword(input: {
  email: string;
  fullName?: string;
  password: string;
}) {
  const existing = await prisma.userProfile.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (existing) {
    throw new Error("Email is already registered");
  }

  const salt = createSalt();
  const passwordHash = hashPassword(input.password, salt);

  const profile = await prisma.userProfile.create({
    data: {
      email: input.email.toLowerCase(),
      fullName: input.fullName?.trim() || null,
      passwordSalt: salt,
      passwordHash,
    },
  });

  await createSession(profile.id);
  return profile;
}

export async function loginWithPassword(input: { email: string; password: string }) {
  const profile = await prisma.userProfile.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (!profile) {
    throw new Error("Invalid email or password");
  }

  const valid = verifyPassword(input.password, profile.passwordSalt, profile.passwordHash);
  if (!valid) {
    throw new Error("Invalid email or password");
  }

  await createSession(profile.id);
  return profile;
}

export async function logout() {
  await destroySession();
}
