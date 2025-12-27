import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (pathname.startsWith('/admin')) {
    // Allow login page and API
    if (pathname === '/admin/login' || pathname.startsWith('/api/admin')) {
      return NextResponse.next();
    }
    
    // Check for admin token cookie
    const adminToken = request.cookies.get('adminToken')?.value;
    
    if (!adminToken || !adminToken.startsWith('enatbet_admin_verified_')) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
