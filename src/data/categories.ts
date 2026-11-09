import type { Locale } from '../i18n/config';

export type Category = 'sea' | 'safari' | 'historical' | 'family';

export const CATEGORY_KEYS: Category[] = ['sea', 'safari', 'historical', 'family'];

/** Temporary English labels; moves into the message dictionaries in Task 5. */
export const CATEGORY_TEXT_EN: Record<Category, { label: string; tag: string; short: string }> = {
  sea: { label: 'Sea & Diving', tag: 'Discover the Red Sea', short: 'Sea' },
  safari: { label: 'Safari', tag: 'Breathe in the desert', short: 'Safari' },
  historical: { label: 'Historical', tag: 'Where history began', short: 'History' },
  family: { label: 'Entertainment', tag: 'Dive into the adventure', short: 'Entertainment' },
};

/** Temporary: same shape as the old CATEGORIES constant. */
export const CATEGORIES_EN: { key: Category; label: string; tag: string }[] = CATEGORY_KEYS.map((key) => ({
  key,
  label: CATEGORY_TEXT_EN[key].label,
  tag: CATEGORY_TEXT_EN[key].tag,
}));

export function tourHref(lang: Locale, slug: string): string {
  return `/${lang}/sharm/${slug}/`;
}
