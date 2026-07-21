import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token");

  const { pathname } = request.nextUrl;

  if (pathname === "/login") {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/unidades/:path*",
    "/kitnets/:path*",
    "/locadores/:path*",
    "/inquilinos/:path*",
    "/contratos/:path*",
    "/financeiro/:path*",
  ],
};