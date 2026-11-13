import type { Locale } from './config';
import en, { type Dict } from './dictionaries/en';
import ru from './dictionaries/ru';
import uz from './dictionaries/uz';

export type { Dict } from './dictionaries/en';
export * from './config';

const DICTS: Record<Locale, Dict> = { en, ru, uz };

export function getDict(locale: Locale): Dict {
  return DICTS[locale];
}

/** "{n} tours" → fill("{n} tours", { n: 5 }) */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));
}

const WEEKDAYS: Record<Locale, string[]> = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  ru: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  uz: ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'],
};

export function weekdayList(locale: Locale, days: number[]): string {
  return days.map((d) => WEEKDAYS[locale][d]).join(', ');
}

const MONTHS: Record<Locale, string[]> = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  uz: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'],
};

/** "2026-11-14" → "14 November 2026" / "14 ноября 2026" / "2026-yil 14-noyabr". Locale-stable (no Intl data differences). */
export function formatDate(locale: Locale, iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return iso;
  const month = MONTHS[locale][m - 1];
  if (locale === 'uz') return `${y}-yil ${d}-${month}`;
  return `${d} ${month} ${y}`;
}
