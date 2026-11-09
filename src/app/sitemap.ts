import type { MetadataRoute } from 'next';
import { site } from '@/data/site';
import { tourHref } from '@/data/categories';
import { tourSlugs } from '@/data/tours';
import { LOCALES } from '@/i18n/config';
import { localeHref } from '@/i18n/routing';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = ['/', '/sharm/', '/about-us/', '/contact/', '/sharm/video/', '/terms-and-conditions/'];
  return LOCALES.flatMap((lang) => [
    ...pages.map((p) => ({
      url: `${site.url}${localeHref(lang, p)}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: p === '/' ? 1 : p === '/sharm/' ? 0.9 : 0.5,
    })),
    ...tourSlugs.map((slug) => ({
      url: `${site.url}${tourHref(lang, slug)}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]);
}
