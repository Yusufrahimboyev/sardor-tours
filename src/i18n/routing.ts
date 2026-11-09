import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from './config';

export function localeHref(lang: Locale, path: string): string {
  return `/${lang}${path}`;
}

export function stripLocale(pathname: string): { lang: Locale | null; rest: string } {
  const m = /^\/([^/]+)(\/.*)?$/.exec(pathname);
  if (m && isLocale(m[1])) return { lang: m[1], rest: m[2] ?? '/' };
  return { lang: null, rest: pathname };
}

export function switchLocalePath(pathname: string, search: string, to: Locale): string {
  return localeHref(to, stripLocale(pathname).rest) + search;
}

export function resolveLocale(cookie: string | undefined, acceptLanguage: string | null): Locale {
  if (isLocale(cookie)) return cookie;
  if (acceptLanguage) {
    const ranked = acceptLanguage
      .split(',')
      .map((part, i) => {
        const [tag, ...attrs] = part.trim().split(';');
        const qAttr = attrs.map((a) => a.trim()).find((a) => a.startsWith('q='));
        const q = qAttr ? Number(qAttr.slice(2)) : 1;
        return { tag: tag.trim(), q: Number.isNaN(q) ? 0 : q, i };
      })
      .filter((e) => e.tag)
      .sort((a, b) => b.q - a.q || a.i - b.i);
    for (const { tag } of ranked) {
      const primary = tag.split('-')[0].toLowerCase();
      if (isLocale(primary)) return primary;
    }
  }
  return DEFAULT_LOCALE;
}

export function alternatesFor(path: string): { languages: Record<Locale | 'x-default', string> } {
  const languages = { 'x-default': localeHref(DEFAULT_LOCALE, path) } as Record<Locale | 'x-default', string>;
  for (const l of LOCALES) languages[l] = localeHref(l, path);
  return { languages };
}

/** Request header the middleware sets on locale-prefixed paths (read by global-not-found). */
export const LOCALE_HEADER = 'x-locale';
