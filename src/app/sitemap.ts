import type { MetadataRoute } from 'next';
import { site } from '@/data/site';
import { tourHref } from '@/data/categories';
import { listTours } from '@/lib/server/tours';
import { LOCALES } from '@/i18n/config';
import { alternatesFor, localeHref } from '@/i18n/routing';

function languages(path: string) {
  const langs = alternatesFor(path).languages ?? {};
  return Object.fromEntries(Object.entries(langs).map(([k, v]) => [k, `${site.url}${v}`]));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tours = await listTours();
  const now = new Date();
  const pages = ['/', '/sharm/', '/about-us/', '/contact/', '/sharm/video/', '/terms-and-conditions/'];
  return LOCALES.flatMap((lang) => [
    ...pages.map((p) => ({
      url: `${site.url}${localeHref(lang, p)}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      alternates: { languages: languages(p) },
      priority: p === '/' ? 1 : p === '/sharm/' ? 0.9 : 0.5,
    })),
    ...tours.map(({ slug }) => ({
      url: `${site.url}${tourHref(lang, slug)}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      alternates: { languages: languages(`/sharm/${slug}/`) },
      priority: 0.8,
    })),
  ]);
}
