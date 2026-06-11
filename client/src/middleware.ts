import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const middleware= (request: NextRequest) => {
    const token = request.cookies.get("token");

    const pathname = request.nextUrl.pathname;

    const authRoutes = ["/login", "/register"];

    const protectedRoutes = ["/dashboard", "/documents"];

    // User logged in
    if (token && authRoutes.includes(pathname)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // User not logged in
    if (!token && protectedRoutes.some((route) => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/dashboard/:path*", "/documents/:path*"],
};