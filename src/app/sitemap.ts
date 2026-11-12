import type { MetadataRoute } from 'next';
import { site } from '@/data/site';
import { LOCALES, LOCALE_TAG } from '@/i18n/config';
import { listTours } from '@/lib/server/tours';
import { listArticles } from '@/lib/server/articles';

/** Every page in every language, with hreflang alternates. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [tours, articles] = await Promise.all([listTours(), listArticles()]);
  const paths: [string, number][] = [
    ['/', 1],
    ['/tours/', 0.9],
    ['/about/', 0.5],
    ['/guide/', 0.6],
    ['/contacts/', 0.5],
    ['/terms/', 0.3],
    ...tours.map((t) => [`/tours/${t.slug}/`, 0.8] as [string, number]),
    ...articles.map((a) => [`/guide/${a.slug}/`, 0.6] as [string, number]),
  ];
  return paths.flatMap(([p, priority]) =>
    LOCALES.map((l) => ({
      url: `${site.url}/${l}${p}`,
      lastModified: now,
      priority,
      alternates: { languages: Object.fromEntries(LOCALES.map((x) => [LOCALE_TAG[x], `${site.url}/${x}${p}`])) },
    })),
  );
}
