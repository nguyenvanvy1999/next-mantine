import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { PATH_DASHBOARD } from '@/routes';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path starts with these prefixes
  const isPublicPath =
    pathname.startsWith('/auth') ||
    pathname === '/' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/fonts') ||
    // Match static file extensions
    /\.(jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot|webp|avif|pdf|txt|xml|json)$/i.test(
      pathname,
    );

  // Check for Better Auth session cookie
  const sessionToken = request.cookies.get('better-auth.session_token');
  const isAuthenticated = !!sessionToken;

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL(PATH_DASHBOARD.default, request.url));
  }

  // Redirect unauthenticated users to login page for protected routes
  if (!isAuthenticated && !isPublicPath) {
    const redirectUrl = new URL('/auth/signin', request.url);
    redirectUrl.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
