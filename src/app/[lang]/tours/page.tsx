import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TourRow } from '@/components/site/TourRow';
import { CATEGORIES } from '@/data/categories';
import { localizeTour } from '@/data/tours';
import { fill, getDict, href, isLocale, PATHS } from '@/i18n';
import { alternates } from '@/i18n/seo';
import { listTours } from '@/lib/server/tours';
import { CatalogFilter } from './CatalogFilter';
import { HydrationBoundary } from '@/components/site/HydrationBoundary';
import s from '@/components/site/site.module.css';

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ cat?: string; q?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDict(lang);
  return {
    title: t.tours.title,
    description: t.tours.intro,
    alternates: alternates(lang, '/tours/'),
  };
}

export default async function ToursPage({ params, searchParams }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const { cat = 'all', q = '' } = await searchParams;
  const needle = q.trim().toLowerCase();
  const tours = (await listTours())
    .map((x) => localizeTour(x, lang))
    .filter((x) => cat === 'all' || x.category === cat)
    .filter((x) => !needle || `${x.name} ${x.excerpt}`.toLowerCase().includes(needle));

  return (
    <HydrationBoundary>
      <section className={s.section}>
        <div className={s.wrap}>
          <h1 className={s.h1}>{t.tours.title}</h1>
          <p className={s.lead}>{t.tours.intro}</p>
          <CatalogFilter
            base={href(lang, PATHS.tours)}
            cat={cat}
            q={q}
            categories={[
              { key: 'all', label: t.tours.filterAll },
              ...CATEGORIES.map((c) => ({
                key: c.key,
                label: t.categories[c.key],
              })),
            ]}
            placeholder={t.tours.searchPlaceholder}
            submit={t.tours.search}
          />
          <p className={s.sub} aria-live="polite">
            {fill(t.tours.found, { n: tours.length })}
          </p>
          {tours.length === 0 ? (
            <p>{t.common.noResults}</p>
          ) : (
            <div className={s.tourList}>
              {tours.map((tour, i) => (
                <TourRow key={tour.slug} tour={tour} locale={lang} t={t.common} priority={i < 2} />
              ))}
            </div>
          )}
        </div>
      </section>
    </HydrationBoundary>
  );
}
