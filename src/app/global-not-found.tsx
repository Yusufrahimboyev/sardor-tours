import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { NotFoundContent } from '@/components/NotFoundContent';
import { site } from '@/data/site';
import { DEFAULT_LOCALE, isLocale } from '@/i18n/config';
import { LOCALE_HEADER } from '@/i18n/routing';
import { fontVariables } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: `Page not found | ${site.name}`,
  robots: { index: false, follow: false },
};

/**
 * Server-rendered 404 for any URL no route matches, including unknown tour slugs
 * (`dynamicParams = false`). The root layout lives in [lang], so this page renders its own
 * <html>; the locale comes from the header the middleware sets on prefixed paths.
 */
export default async function GlobalNotFound() {
  const raw = (await headers()).get(LOCALE_HEADER);
  const lang = isLocale(raw) ? raw : DEFAULT_LOCALE;
  return (
    <html lang={lang} className={fontVariables}>
      <body>
        <NotFoundContent lang={lang} />
      </body>
    </html>
  );
}
