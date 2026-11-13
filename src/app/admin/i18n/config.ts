export const ADMIN_LANGS = ['uz', 'ru', 'en'] as const;
export type AdminLang = (typeof ADMIN_LANGS)[number];
export const DEFAULT_ADMIN_LANG: AdminLang = 'uz';
/** Remembers the admin interface language (independent of the public site language). */
export const ADMIN_LANG_COOKIE = 'admin_lang';
export const ADMIN_LANG_SHORT: Record<AdminLang, string> = { uz: 'UZ', ru: 'RU', en: 'EN' };
/** BCP-47 tags for <html lang>-like attributes and Intl date formatting. */
export const ADMIN_LANG_TAG: Record<AdminLang, string> = { uz: 'uz-Latn-UZ', ru: 'ru-RU', en: 'en-GB' };

export function isAdminLang(v: unknown): v is AdminLang {
  return typeof v === 'string' && (ADMIN_LANGS as readonly string[]).includes(v);
}

/** "2026-11-14T10:00:00Z" → short date + time in the admin language. */
export function formatDateTime(lang: AdminLang, iso: string, dateStyle: 'short' | 'medium' = 'medium'): string {
  return new Date(iso).toLocaleString(ADMIN_LANG_TAG[lang], { dateStyle, timeStyle: 'short' });
}

/** "2026-11-14" → "Sat, 14 November 2026" in the admin language (UTC-stable). */
export function formatTourDate(lang: AdminLang, ymd: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return ymd;
  const d = new Date(`${ymd}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return ymd;
  return d.toLocaleDateString(ADMIN_LANG_TAG[lang], { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
