import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-please-set-env'
);

const PUBLIC_PATHS = ['/', '/login', '/register'];
const ADMIN_PATHS = ['/admin'];
const PROTECTED_PATHS = ['/orders', '/checkout'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API route'larını geç (kendi içinde koruma var)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token')?.value;
  let payload = null;

  if (token) {
    try {
      const result = await jwtVerify(token, JWT_SECRET);
      payload = result.payload as any;
    } catch {
      payload = null;
    }
  }

  // Admin sayfalarını koru
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    if (!payload) {
      return NextResponse.redirect(new URL('/login?redirect=' + pathname, request.url));
    }
    if (payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Korumalı müşteri sayfaları
  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
    if (!payload) {
      return NextResponse.redirect(new URL('/login?redirect=' + pathname, request.url));
    }
  }

  // Giriş yapmış kullanıcı login/register'a gitmesin
  if ((pathname === '/login' || pathname === '/register') && payload) {
    if (payload.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
