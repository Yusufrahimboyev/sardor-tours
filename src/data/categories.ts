import type { Locale } from '../i18n/config';
import type { T } from '../i18n/translate';

export type Category = 'sea' | 'safari' | 'historical' | 'family';

export const CATEGORY_KEYS: Category[] = ['sea', 'safari', 'historical', 'family'];

/** Localised category list; `t` is a server translator (see `getT`). */
export function categoryList(t: T): { key: Category; label: string; tag: string }[] {
  return CATEGORY_KEYS.map((key) => ({
    key,
    label: t(`sharm.categories.${key}.label`),
    tag: t(`sharm.categories.${key}.tag`),
  }));
}

/** Short bestseller tag, e.g. "Sea". */
export function categoryShort(t: T, key: Category): string {
  return t(`sharm.categories.${key}.short`);
}

export function tourHref(lang: Locale, slug: string): string {
  return `/${lang}/sharm/${slug}/`;
}
