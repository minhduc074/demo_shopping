import { NextRequest, NextResponse } from "next/server";
import { logout } from "@/lib/auth";

export async function POST(req: NextRequest) {
  await logout();
  const res = NextResponse.redirect(new URL("/", req.url));
  return res;
}
