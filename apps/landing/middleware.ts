import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ONLY_ROUTES = ["/", "/onboard", "/login"];

export function middleware(req: NextRequest): NextResponse {
  const session = req.cookies.get("__session")?.value;
  const { pathname } = req.nextUrl;

  // Authenticated user hitting a public-only page → send to dashboard
  if (session && PUBLIC_ONLY_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard/home", req.url));
  }

  // Unauthenticated user hitting a protected page → send to onboard
  if (!session && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/onboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/onboard", "/login", "/dashboard/:path*"],
};
