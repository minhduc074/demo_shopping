import crypto from "node:crypto";
import { cookies } from "next/headers";
import { CART_COOKIE_NAME } from "@/lib/constants";

export async function getOrCreateCartSessionKey() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CART_COOKIE_NAME)?.value;

  if (existing) {
    return existing;
  }

  const sessionKey = crypto.randomBytes(24).toString("hex");

  cookieStore.set(CART_COOKIE_NAME, sessionKey, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return sessionKey;
}
