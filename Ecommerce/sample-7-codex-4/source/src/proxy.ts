import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

const protectedPrefixes = ["/tai-khoan", "/thanh-toan", "/admin"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requiresAuth = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!requiresAuth) {
    return NextResponse.next();
  }

  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!session) {
    return NextResponse.redirect(new URL("/dang-nhap", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/tai-khoan/:path*", "/thanh-toan", "/admin/:path*"],
};
