import { site } from '@/data/site';
import { OG_LOCALE, type Locale } from './config';
import { alternatesFor, localeHref } from './routing';

/** `alternates` for a page: canonical in the current locale plus hreflang links for all of them. */
export function pageAlternates(lang: Locale, path: string) {
  return { canonical: localeHref(lang, path), languages: alternatesFor(path).languages };
}

/** `openGraph` for a page. Next replaces (not merges) the layout's openGraph, so shared fields repeat here. */
export function pageOpenGraph(lang: Locale, path: string, extra: Record<string, unknown> = {}) {
  return { type: 'website' as const, siteName: site.name, locale: OG_LOCALE[lang], url: localeHref(lang, path), ...extra };
}
