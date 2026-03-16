import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return new TextEncoder().encode(secret);
};

// Routes that require authentication
const protectedPaths = ['/dashboard'];

// Routes that are always public
const publicPaths = ['/', '/login', '/register', '/terms', '/privacy', '/forgot-password', '/verify-email'];

function isProtectedRoute(pathname: string): boolean {
  return protectedPaths.some(path => pathname.startsWith(path));
}

function isPublicRoute(pathname: string): boolean {
  // API routes, static files, and explicitly public paths
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.startsWith('/favicon')) {
    return true;
  }
  return publicPaths.some(path => pathname === path);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes
  if (isPublicRoute(pathname)) {
    // If user is logged in and tries to access login/register, redirect to dashboard
    if (pathname === '/login' || pathname === '/register') {
      const token = request.cookies.get('jwt-token')?.value;
      if (token) {
        try {
          await jwtVerify(token, getJwtSecretKey());
          return NextResponse.redirect(new URL('/dashboard', request.url));
        } catch {
          // Token invalid, let them access login/register
        }
      }
    }
    return NextResponse.next();
  }

  // Check authentication for protected routes
  if (isProtectedRoute(pathname)) {
    const token = request.cookies.get('jwt-token')?.value;

    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      await jwtVerify(token, getJwtSecretKey());
      return NextResponse.next();
    } catch {
      // Token expired or invalid — redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      // Clear the invalid token
      response.cookies.set('jwt-token', '', { maxAge: 0 });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
