import type { Metadata } from 'next';
import { site } from '@/data/site';
import { DEFAULT_LOCALE, LOCALES, LOCALE_TAG, type Locale } from './config';

/**
 * canonical + hreflang alternates for a page that exists in every language.
 * `path` is the part after the locale, e.g. "/tours/" or "/tours/quad-safari/".
 */
export function alternates(locale: Locale, path: string): Metadata['alternates'] {
  const p = path.startsWith('/') ? path : `/${path}`;
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[LOCALE_TAG[l]] = `${site.url}/${l}${p}`;
  languages['x-default'] = `${site.url}/${DEFAULT_LOCALE}${p}`;
  return { canonical: `${site.url}/${locale}${p}`, languages };
}
