import { notFound } from 'next/navigation';
import { isLocale, type Locale } from './config';

/** Awaits a route's `params`, narrows `lang` with `isLocale`, and 404s on anything else. */
export async function langFrom(params: Promise<{ lang: string }>): Promise<Locale> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return lang;
}
