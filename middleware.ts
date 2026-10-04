import { NextResponse, type NextRequest } from "next/server";

/**
 * Defence in depth: the admin layout performs a real database session check.
 * This middleware only short-circuits obviously unauthenticated requests.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has("nova_admin_session");
  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
