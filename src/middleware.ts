import { NextResponse, type NextRequest } from 'next/server';
import { LOCALE_HEADER, localeHref, resolveLocale, stripLocale } from '@/i18n/routing';

/**
 * Every page lives under /{lang}/. Unprefixed page URLs (including legacy links such as
 * /booking/ST-XXXXXX/) are redirected (307) to the visitor's locale, chosen from the
 * `lang` cookie, then Accept-Language, then the default. The query string is preserved.
 * Prefixed requests pass through with an `x-locale` request header so the global 404
 * page (which has no route params) can render in the right language.
 * This middleware never sets a cookie.
 */
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const prefixed = stripLocale(pathname).lang;
  if (prefixed) {
    const headers = new Headers(req.headers);
    headers.set(LOCALE_HEADER, prefixed);
    return NextResponse.next({ request: { headers } });
  }

  const lang = resolveLocale(req.cookies.get('lang')?.value, req.headers.get('accept-language'));
  const url = req.nextUrl.clone();
  url.pathname = localeHref(lang, pathname);
  url.search = search;
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
