import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest): NextResponse {
  const session = req.cookies.get("__session")?.value;
  const { pathname } = req.nextUrl;

  // Authenticated user on sign-in page → send to dashboard
  if (session && pathname === "/sign-in") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Unauthenticated user on any protected page → send to sign-in
  if (!session && pathname !== "/sign-in" && !pathname.startsWith("/api")) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
