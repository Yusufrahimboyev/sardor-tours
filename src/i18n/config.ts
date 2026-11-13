export const LOCALES = ['en', 'ru', 'uz'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
/** Remembers the language a visitor picked in the switcher. */
export const LOCALE_COOKIE = 'locale';

export const LOCALE_NAMES: Record<Locale, string> = { en: 'English', ru: 'Русский', uz: 'O‘zbekcha' };
export const LOCALE_SHORT: Record<Locale, string> = { en: 'EN', ru: 'RU', uz: 'UZ' };
/** BCP-47 tags for <html lang>, hreflang and Intl formatting. */
export const LOCALE_TAG: Record<Locale, string> = { en: 'en-GB', ru: 'ru-RU', uz: 'uz-Latn-UZ' };

export function isLocale(v: unknown): v is Locale {
  return typeof v === 'string' && (LOCALES as readonly string[]).includes(v);
}

/** Picks the best supported locale from an Accept-Language header. */
export function negotiateLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=');
      return { tag: tag.toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { tag } of ranked) {
    const base = tag.split('-')[0];
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}

/** Site paths (without the locale prefix). */
export const PATHS = {
  home: '/',
  tours: '/tours/',
  about: '/about/',
  guide: '/guide/',
  contacts: '/contacts/',
  terms: '/terms/',
} as const;

export function href(locale: Locale, path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${p === '/' ? '/' : p}`;
}

export function tourPath(locale: Locale, slug: string): string {
  return `/${locale}/tours/${slug}/`;
}

export function articlePath(locale: Locale, slug: string): string {
  return `/${locale}/guide/${slug}/`;
}
