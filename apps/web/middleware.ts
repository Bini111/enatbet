import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Temporarily disabled - enable after adding auth
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
