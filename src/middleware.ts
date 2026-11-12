import { NextResponse, type NextRequest } from 'next/server';
import { LOCALE_HEADER, localeHref, resolveLocale, stripLocale } from '@/i18n/routing';
import { getTour } from '@/lib/server/tours';

/**
 * Every page lives under /{lang}/. Unprefixed page URLs (including legacy links such as
 * /booking/ST-XXXXXX/) are redirected (307) to the visitor's locale, chosen from the
 * `lang` cookie, then Accept-Language, then the default. The query string is preserved.
 * Prefixed requests pass through with an `x-locale` request header so the global 404
 * page (which has no route params) can render in the right language.
 * Tours are editable at runtime, so their pages accept any slug; a slug the tour store does
 * not know (or a hidden tour) is rewritten to an unmatched path here, which makes it a
 * server-rendered, localised 404 like every other unknown URL.
 * This middleware never sets a cookie.
 */
export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const { lang: prefixed, rest } = stripLocale(pathname);
  if (prefixed) {
    const headers = new Headers(req.headers);
    headers.set(LOCALE_HEADER, prefixed);
    const slug = /^\/sharm\/([^/]+)\/?$/.exec(rest)?.[1];
    if (slug && slug !== 'video' && !(await getTour(decodeURIComponent(slug)))) {
      const missing = req.nextUrl.clone();
      missing.pathname = localeHref(prefixed, '/_missing/');
      return NextResponse.rewrite(missing, { request: { headers } });
    }
    return NextResponse.next({ request: { headers } });
  }

  const lang = resolveLocale(req.cookies.get('lang')?.value, req.headers.get('accept-language'));
  const url = req.nextUrl.clone();
  url.pathname = localeHref(lang, pathname);
  url.search = search;
  return NextResponse.redirect(url, 307);
}

export const config = {
  // Node.js runtime: the tour store reads from disk.
  runtime: 'nodejs',
  matcher: ['/((?!api|admin|media|_next|.*\\..*).*)'],
};
