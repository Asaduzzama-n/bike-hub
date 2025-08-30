import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function middleware(request: NextRequest) {
  // Check if the request is for admin routes (both pages and API)
  if (request.nextUrl.pathname.startsWith('/admin') || 
      request.nextUrl.pathname.startsWith('/api/admin')) {
    
    // Allow access to login page and auth API
    if (request.nextUrl.pathname === '/admin/login' ||
        request.nextUrl.pathname.startsWith('/api/admin/auth/')) {
      return NextResponse.next();
    }

    // Check for admin token
    const token = request.cookies.get('auth-token')?.value ||
                  request.cookies.get('adminToken')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // For API routes, return 401
      if (request.nextUrl.pathname.startsWith('/api/admin')) {
        return NextResponse.json(
          { success: false, message: 'Access denied. No token provided.' },
          { status: 401 }
        );
      }
      // For admin pages, redirect to login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      // Verify the JWT token
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      console.error('Token verification failed:', error);
      
      // For API routes, return 401
      if (request.nextUrl.pathname.startsWith('/api/admin')) {
        return NextResponse.json(
          { success: false, message: 'Invalid or expired token.' },
          { status: 401 }
        );
      }
      // For admin pages, redirect to login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ],
};