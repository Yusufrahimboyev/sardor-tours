export const LOCALES = ['uz', 'en', 'ru'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(v: unknown): v is Locale {
  return typeof v === 'string' && (LOCALES as readonly string[]).includes(v);
}

export const INTL_LOCALE: Record<Locale, string> = {
  uz: 'uz-Latn-UZ',
  en: 'en-GB',
  ru: 'ru-RU',
};

export const OG_LOCALE: Record<Locale, string> = {
  uz: 'uz_UZ',
  en: 'en_GB',
  ru: 'ru_RU',
};

export const LOCALE_LABEL: Record<Locale, 'UZ' | 'EN' | 'RU'> = {
  uz: 'UZ',
  en: 'EN',
  ru: 'RU',
};
