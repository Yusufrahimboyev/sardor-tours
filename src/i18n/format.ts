import { parseISODate } from '../lib/dates';
import { INTL_LOCALE, type Locale } from './config';

/** Weekday, day, long month and year, e.g. "Tue, 10 November 2026". Returns the input if unparsable. */
export function formatDate(iso: string, lang: Locale): string {
  const d = parseISODate(iso);
  if (!d) return iso;
  return d.toLocaleDateString(INTL_LOCALE[lang], {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** Long weekday names (0 = Sunday) joined by ', '. */
export function weekdayNames(days: number[], lang: Locale): string {
  const fmt = new Intl.DateTimeFormat(INTL_LOCALE[lang], { weekday: 'long', timeZone: 'UTC' });
  // 2026-11-08 is a Sunday.
  return days.map((d) => fmt.format(new Date(Date.UTC(2026, 10, 8 + d, 12)))).join(', ');
}

export function formatPrice(n: number, lang: Locale): string {
  return '£' + new Intl.NumberFormat(INTL_LOCALE[lang]).format(n);
}
