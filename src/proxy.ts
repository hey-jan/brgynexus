import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_for_development_only_12345'
);

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('brgynexus_session')?.value;
  const path = request.nextUrl.pathname;

  // Protect /resident, /staff, /admin
  const isProtectedRoute = path.startsWith('/resident') || path.startsWith('/staff') || path.startsWith('/admin');

  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const { payload } = await jwtVerify(token, secret);
      
      // Role-Based Access Control
      if (path.startsWith('/admin') && payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      if (path.startsWith('/staff') && payload.role !== 'STAFF' && payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      if (path.startsWith('/resident') && payload.role !== 'RESIDENT') {
        return NextResponse.redirect(new URL('/login', request.url));
      }

    } catch (error) {
      // Invalid or expired token
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('brgynexus_session');
      return response;
    }
  }

  // Redirect logged-in users away from auth pages
  const isAuthRoute = path === '/login' || path === '/register';
  if (isAuthRoute && token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      if (payload.role === 'ADMIN') return NextResponse.redirect(new URL('/admin', request.url));
      if (payload.role === 'STAFF') return NextResponse.redirect(new URL('/staff', request.url));
      return NextResponse.redirect(new URL('/resident', request.url));
    } catch (error) {
      // Token invalid, allow them to see login page
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
};
