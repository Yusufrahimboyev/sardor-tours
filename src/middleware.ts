import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, negotiateLocale, type Locale } from '@/i18n/config';

/** Old (single-language clone) URLs → new structure, so links and search results keep working. */
function legacyRedirect(pathname: string): string | null {
  const m = pathname.match(/^\/en\/(sharm|about-us|contact|terms-and-conditions)(\/.*)?$/);
  if (m) {
    const [, section, rest = '/'] = m;
    if (section === 'sharm') {
      const slug = rest.replace(/^\/|\/$/g, '');
      return !slug || slug === 'video' ? '/en/tours/' : `/en/tours/${slug}/`;
    }
    return { 'about-us': '/en/about/', contact: '/en/contacts/', 'terms-and-conditions': '/en/terms/' }[section] ?? null;
  }
  const b = pathname.match(/^\/booking\/([^/]+)\/?$/);
  if (b) return `/en/booking/${b[1]}/`;
  return null;
}

function preferredLocale(req: NextRequest): Locale {
  const c = req.cookies.get(LOCALE_COOKIE)?.value;
  return isLocale(c) ? c : negotiateLocale(req.headers.get('accept-language'));
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const legacy = legacyRedirect(pathname);
  if (legacy) return NextResponse.redirect(new URL(legacy + search, req.url), 308);

  const first = pathname.split('/')[1];
  if (isLocale(first)) {
    // Expose the locale to the root layout (<html lang>) without making it a route param there.
    const headers = new Headers(req.headers);
    headers.set('x-locale', first);
    return NextResponse.next({ request: { headers } });
  }

  // No locale prefix: send the visitor to their language (cookie → Accept-Language → English).
  const locale = pathname === '/' ? preferredLocale(req) : DEFAULT_LOCALE;
  const target = pathname === '/' ? `/${locale}/` : `/${locale}${pathname}`;
  return NextResponse.redirect(new URL(target + search, req.url), pathname === '/' ? 307 : 308);
}

export const config = {
  runtime: 'nodejs',
  // Everything except API, admin, media, Next internals and files with an extension.
  matcher: ['/((?!api|admin|media|_next|.*\\..*).*)'],
};
