import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((request) => {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const user = request.auth?.user;
    if (!user) {
      const loginUrl = new URL("/login", request.nextUrl.origin);
      loginUrl.searchParams.set("role", "admin");
      loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (user.role !== "ADVOCATE" && user.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.nextUrl.origin));
    }
  }
  return NextResponse.next();
});

export const config = { matcher: ["/admin/:path*"] };
