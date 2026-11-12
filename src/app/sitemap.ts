import type { MetadataRoute } from 'next';
import { site } from '@/data/site';
import { tourHref } from '@/data/tours';
import { listTours } from '@/lib/server/tours';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tours = await listTours();
  const now = new Date();
  const pages = ['/', '/en/sharm/', '/en/about-us/', '/en/contact/', '/en/sharm/video/', '/en/terms-and-conditions/'];
  return [
    ...pages.map((p) => ({
      url: `${site.url}${p}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: p === '/' ? 1 : p === '/en/sharm/' ? 0.9 : 0.5,
    })),
    ...tours.map((t) => ({
      url: `${site.url}${tourHref(t.slug)}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
