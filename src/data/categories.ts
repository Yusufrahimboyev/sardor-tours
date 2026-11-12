import type { Locale } from '../i18n/config';
import type { T } from '../i18n/translate';

/** Kept separate from tours.ts so client components don't pull the whole tour JSON into the bundle. */
export type Category = 'sea' | 'safari' | 'historical' | 'family';

export const CATEGORY_KEYS: Category[] = ['sea', 'safari', 'historical', 'family'];

/** English category names: used by the admin panel and stored on tours it saves. */
export const CATEGORIES: { key: Category; label: string; tag: string }[] = [
  { key: 'sea', label: 'Sea & Diving', tag: 'Discover the Red Sea' },
  { key: 'safari', label: 'Safari', tag: 'Breathe in the desert' },
  { key: 'historical', label: 'Historical', tag: 'Where history began' },
  { key: 'family', label: 'Entertainment', tag: 'Dive into the adventure' },
];

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
