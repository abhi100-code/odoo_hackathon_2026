import { NextResponse } from 'next/server';

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    const decoded = parseJwt(token);
    if (!decoded || (decoded.exp && decoded.exp * 1000 < Date.now())) {
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.set('token', '', { expires: new Date(0), path: '/' });
      return response;
    }

    const userRole = decoded.role;

    if (pathname.startsWith('/dashboard/vehicles')) {
      const allowed = ['Fleet Manager', 'Safety Officer', 'Transport Administrator'];
      if (!allowed.includes(userRole)) {
        return NextResponse.redirect(new URL('/dashboard?error=AccessDenied', request.url));
      }
    }

    if (pathname.startsWith('/dashboard/drivers')) {
      const allowed = ['Fleet Manager', 'Safety Officer', 'Transport Administrator'];
      if (!allowed.includes(userRole)) {
        return NextResponse.redirect(new URL('/dashboard?error=AccessDenied', request.url));
      }
    }

    if (pathname.startsWith('/dashboard/trips')) {
      const allowed = ['Dispatcher', 'Transport Administrator'];
      if (!allowed.includes(userRole)) {
        return NextResponse.redirect(new URL('/dashboard?error=AccessDenied', request.url));
      }
    }

    if (pathname.startsWith('/dashboard/maintenance')) {
      const allowed = ['Fleet Manager', 'Safety Officer', 'Transport Administrator'];
      if (!allowed.includes(userRole)) {
        return NextResponse.redirect(new URL('/dashboard?error=AccessDenied', request.url));
      }
    }

    if (pathname.startsWith('/dashboard/fuel')) {
      const allowed = ['Fleet Manager', 'Financial Analyst', 'Transport Administrator'];
      if (!allowed.includes(userRole)) {
        return NextResponse.redirect(new URL('/dashboard?error=AccessDenied', request.url));
      }
    }

    if (pathname.startsWith('/dashboard/expenses')) {
      const allowed = ['Financial Analyst', 'Transport Administrator'];
      if (!allowed.includes(userRole)) {
        return NextResponse.redirect(new URL('/dashboard?error=AccessDenied', request.url));
      }
    }

    if (pathname.startsWith('/dashboard/analytics')) {
      const allowed = ['Financial Analyst', 'Transport Administrator'];
      if (!allowed.includes(userRole)) {
        return NextResponse.redirect(new URL('/dashboard?error=AccessDenied', request.url));
      }
    }
  }

  if (pathname === '/') {
    if (token) {
      const decoded = parseJwt(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/'],
};
