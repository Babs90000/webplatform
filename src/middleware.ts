import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TOKEN_COOKIE = "webplatform_token";
const AUTH_PAGES = ["/login", "/register"];

const readTokenFromCookie = (request: NextRequest): string | undefined => {
  const raw = request.cookies.get(TOKEN_COOKIE)?.value;
  if (!raw || raw === "undefined") return undefined;

  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
};

/**
 * Protection des routes (middleware Next.js).
 * Gating UX basé sur le cookie de session — l'autorisation réelle reste côté API.
 */
export const middleware = (request: NextRequest): NextResponse => {
  const token = readTokenFromCookie(request);
  const { pathname } = request.nextUrl;
  const isAuthPage = AUTH_PAGES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isAuthPage) {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.includes("/preview")) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/projects/:path*",
    "/login",
    "/register",
  ],
};
