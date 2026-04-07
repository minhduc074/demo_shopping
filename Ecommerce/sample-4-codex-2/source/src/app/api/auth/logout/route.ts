import { NextResponse } from "next/server";
import { clearSessionCookie, deleteSessionByToken, SESSION_COOKIE } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST() {
  const token = cookies().get(SESSION_COOKIE)?.value;

  if (token) {
    await deleteSessionByToken(token);
  }

  await clearSessionCookie();

  return NextResponse.json({ message: "Signed out." });
}
