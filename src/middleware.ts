import { NextResponse, type NextRequest } from 'next/server';

const COOKIE_NAME = 'accessToken';

const PROTECTED_PREFIXES = ['/feed', '/perfil', '/admin'];
const GUEST_ONLY_PREFIXES = ['/login', '/register'];

function matches(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const hasCookie = Boolean(req.cookies.get(COOKIE_NAME)?.value);

  if (matches(pathname, PROTECTED_PREFIXES) && !hasCookie) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (matches(pathname, GUEST_ONLY_PREFIXES) && hasCookie) {
    const url = req.nextUrl.clone();
    url.pathname = '/feed';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/feed/:path*',
    '/perfil/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
};
