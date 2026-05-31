import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TOKEN_COOKIE = "webplatform_token";
const AUTH_PAGES = ["/login", "/register"];

/**
 * Protection des routes (Next 16 « proxy », ex-middleware).
 * Gating UX basé sur la présence du cookie de session — l'autorisation réelle
 * reste appliquée côté API. Le JWT n'est pas vérifié ici (pas de secret côté
 * edge), on ne contrôle que la présence du token.
 */
export const proxy = (request: NextRequest): NextResponse => {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const { pathname } = request.nextUrl;
  const isAuthPage = AUTH_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  // Déjà connecté → on évite les pages d'auth.
  if (isAuthPage) {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Les previews de site sont consultables sans session.
  if (pathname.includes("/preview")) {
    return NextResponse.next();
  }

  // Routes protégées sans token → redirection vers la connexion.
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
