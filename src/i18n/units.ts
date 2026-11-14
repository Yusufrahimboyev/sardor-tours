import type { Locale } from './config';

/**
 * Price units are stored once per tour in English ("boat", "2 people"); these tables give the
 * Russian and Uzbek wording. A unit an admin invents that is not listed here is shown as typed.
 */
const UNITS: Record<Exclude<Locale, 'en'>, Record<string, { unit: string; per: string }>> = {
  ru: {
    person: { unit: 'человек', per: 'с человека' },
    hour: { unit: 'час', per: 'за час' },
    boat: { unit: 'катер', per: 'за катер' },
    course: { unit: 'курс', per: 'за курс' },
    group: { unit: 'группа', per: 'за группу' },
    buggy: { unit: 'багги', per: 'за багги' },
    seat: { unit: 'место', per: 'за место' },
    passport: { unit: 'паспорт', per: 'за паспорт' },
    '2 people': { unit: '2 человека', per: 'за двоих' },
    '4 people': { unit: '4 человека', per: 'за четверых' },
  },
  uz: {
    person: { unit: 'kishi', per: 'kishi boshiga' },
    hour: { unit: 'soat', per: 'soatiga' },
    boat: { unit: 'qayiq', per: 'qayiq uchun' },
    course: { unit: 'kurs', per: 'kurs uchun' },
    group: { unit: 'guruh', per: 'guruh uchun' },
    buggy: { unit: 'baggi', per: 'baggi uchun' },
    seat: { unit: 'o‘rin', per: 'o‘rin uchun' },
    passport: { unit: 'pasport', per: 'pasport uchun' },
    '2 people': { unit: '2 kishi', per: '2 kishi uchun' },
    '4 people': { unit: '4 kishi', per: '4 kishi uchun' },
  },
};

/** "boat" → "катер" (shown after a slash: "£100 / катер"). */
export function unitLabel(locale: Locale, unit: string): string {
  return locale === 'en' ? unit : (UNITS[locale][unit.trim().toLowerCase()]?.unit ?? unit);
}

/** "per boat" → "за катер" (shown after a "from" price). */
export function perUnitLabel(locale: Locale, text: string): string {
  if (locale === 'en') return text;
  const unit = text.trim().toLowerCase().replace(/^per\s+/, '');
  return UNITS[locale][unit]?.per ?? text;
}
