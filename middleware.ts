import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and static assets
  const publicRoutes = ["/login", "/api"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Allow root path to render (auth redirect happens on client)
  if (pathname === "/") {
    return NextResponse.next();
  }

  // Get token from cookies or localStorage (via header)
  const token = request.cookies.get("authToken")?.value;

  // Redirect to login if no token and trying to access protected routes
  if (
    !token &&
    (pathname.startsWith("/dashboard") || pathname.startsWith("/liabilities"))
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
