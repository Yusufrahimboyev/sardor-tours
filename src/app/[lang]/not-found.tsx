'use client';

import { useParams } from 'next/navigation';
import { NotFoundContent } from '@/components/NotFoundContent';
import { DEFAULT_LOCALE, isLocale } from '@/i18n/config';

/**
 * Only reached by notFound() thrown from a page (e.g. an unknown booking reference). Next
 * renders that case client-side; unknown URLs and tour slugs are served, server-rendered,
 * by app/global-not-found.tsx instead.
 */
export default function NotFound() {
  const { lang } = useParams<{ lang?: string }>();
  return <NotFoundContent lang={isLocale(lang) ? lang : DEFAULT_LOCALE} />;
}
