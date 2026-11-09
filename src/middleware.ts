import { NextResponse, type NextRequest } from 'next/server';
import { localeHref, resolveLocale, stripLocale } from '@/i18n/routing';

/**
 * Every page lives under /{lang}/. Unprefixed page URLs (including legacy links such as
 * /booking/ST-XXXXXX/) are redirected (307) to the visitor's locale, chosen from the
 * `lang` cookie, then Accept-Language, then the default. The query string is preserved.
 * This middleware never sets a cookie; it only redirects.
 */
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (stripLocale(pathname).lang) return NextResponse.next();

  const lang = resolveLocale(req.cookies.get('lang')?.value, req.headers.get('accept-language'));
  const url = req.nextUrl.clone();
  url.pathname = localeHref(lang, pathname);
  url.search = search;
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
