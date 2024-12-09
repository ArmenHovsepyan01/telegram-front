import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { applySetCookie } from '@/utilis/helpers/applySetCookie';
import AuthService from '@/services/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken');
  const pathname = request.nextUrl.pathname;

  console.log('pathname:', pathname);

  if (pathname === '/') {
    const searchParams = new URLSearchParams(request.nextUrl.searchParams);
    const accessToken = searchParams.get('idToken');

    if (accessToken) {
      const authService = new AuthService();

      try {
        const response = await authService.getUserProfile(accessToken);

        console.log('Verify me response', response);

        const res = NextResponse.redirect(new URL('/home', request.url));
        res.cookies.set('accessToken', accessToken);
        applySetCookie(request, res);

        return res;
      } catch (error) {
        console.log('Verify me error', error);
        return NextResponse.redirect(new URL('/login', request.url));
      }
    } else {
      return NextResponse.redirect(new URL('/home', request.url));
    }
  }

  if (['/login', '/register'].includes(pathname)) {
    if (!!token) {
      return NextResponse.redirect(new URL('/home', request.url));
    }

    return NextResponse.next();
  }

  if (pathname === '/login') {
    return NextResponse.next();
  }

  if (pathname === '/registaration-success') {
    const searchParams = new URLSearchParams(request.nextUrl.searchParams);
    if (searchParams.get('from') !== 'register') {
      return NextResponse.redirect(new URL('/home', request.url));
    }

    return NextResponse.next();
  }

  if (!token?.value) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next|static|favicon.ico).*)'
};
