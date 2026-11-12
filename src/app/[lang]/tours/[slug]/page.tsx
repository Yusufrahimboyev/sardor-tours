import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JsonLd, faqJsonLd } from '@/components/JsonLd';
import { BookingForm } from '@/components/site/BookingForm';
import { Gallery } from '@/components/site/Gallery';
import { TourRow } from '@/components/site/TourRow';
import { site } from '@/data/site';
import { localizeTour } from '@/data/tours';
import { getDict, href, isLocale, LOCALES, PATHS, weekdayList } from '@/i18n';
import { alternates } from '@/i18n/seo';
import { imageSrc, usingPlaceholders } from '@/lib/images';
import { formatGBP } from '@/lib/pricing';
import { getTour, listTours } from '@/lib/server/tours';
import { HydrationBoundary } from '@/components/site/HydrationBoundary';
import s from '@/components/site/site.module.css';

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateStaticParams() {
  const tours = await listTours();
  return LOCALES.flatMap((lang) => tours.map((t) => ({ lang, slug: t.slug })));
}
/** Tours added in the admin panel after the build render on first request. */
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const raw = await getTour(slug);
  if (!raw) return {};
  const tour = localizeTour(raw, lang);
  const title = tour.metaTitle.replace(/\s*\|\s*(Sardor|Sharm) Tours\s*$/i, '');
  return {
    title,
    description: tour.metaDescription,
    alternates: alternates(lang, `/tours/${slug}/`),
    openGraph: {
      title,
      description: tour.metaDescription,
      images: tour.cardImage ? [{ url: imageSrc(tour.cardImage, 1200, 630) }] : [],
    },
  };
}

export default async function TourPage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const raw = await getTour(slug);
  if (!raw) notFound();
  const t = getDict(lang);
  const tour = localizeTour(raw, lang);
  const all = await listTours();
  const related = tour.related
    .map((r) => all.find((x) => x.slug === r.slug))
    .filter((x): x is NonNullable<typeof x> => !!x)
    .slice(0, 3)
    .map((x) => localizeTour(x, lang));

  const photos = [tour.cardImage, ...tour.gallery.map((g) => g.src)].filter((p, i, a) => p && a.indexOf(p) === i);
  const shown = usingPlaceholders ? photos.slice(0, 8) : photos;
  const schedule = tour.scheduleDays ? weekdayList(lang, tour.scheduleDays) : tour.schedule;
  const paid = tour.options.filter((o) => o.group === 'guests');
  const extras = tour.options.filter((o) => o.group === 'extras');
  const old = tour.heroPrices[0]?.oldPrice;

  return (
    <HydrationBoundary>
      <article className={s.wrap}>
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'TouristTrip',
            name: tour.name,
            description: tour.metaDescription,
            url: `${site.url}/${lang}/tours/${tour.slug}/`,
            offers: {
              '@type': 'Offer',
              price: String(tour.priceFrom),
              priceCurrency: 'GBP',
            },
          }}
        />
        {tour.faq.length > 0 && <JsonLd data={faqJsonLd(tour.faq)} />}

        <nav className={s.crumbs} aria-label="Breadcrumb">
          <Link href={href(lang, PATHS.home)}>{t.nav.home}</Link> / <Link href={href(lang, PATHS.tours)}>{t.nav.tours}</Link> /{' '}
          <span aria-current="page">{tour.name}</span>
        </nav>

        <h1 className={s.h1} style={{ marginTop: 12 }}>
          {tour.title || tour.name}
        </h1>
        <div className={s.facts}>
          {tour.detailDuration && (
            <span>
              {t.tour.duration}: <b>{tour.detailDuration}</b>
            </span>
          )}
          <span>
            {t.tour.schedule}: <b>{schedule}</b>
          </span>
          {tour.timeText && (
            <span>
              {t.tour.time}: <b>{tour.timeText}</b>
            </span>
          )}
        </div>

        <Gallery photos={shown} alt={tour.name} labels={t.tour} />

        {tour.excerpt && <p className={s.lead}>{tour.excerpt}</p>}

        <section className={s.section} style={{ paddingTop: 32 }} aria-labelledby="prices-h">
          <h2 id="prices-h" className={s.h2}>
            {t.tour.prices}
          </h2>
          <div className={s.priceTable}>
            {[...paid, ...extras].map((o, i) => (
              <div key={o.key}>
                <span>{o.label}</span>
                <b>
                  {i === 0 && old && <s>{formatGBP(old)}</s>}
                  {o.price ? formatGBP(o.price) : o.unit === 'included' ? t.common.included : t.common.free}
                  {o.price > 0 && o.unit && o.unit !== 'person' && <small style={{ fontWeight: 500 }}> / {o.unit}</small>}
                </b>
              </div>
            ))}
          </div>
          {!tour.requiresDeposit && <p className={s.note}>✓ {t.tour.payOnDay}</p>}
          {tour.highlights.length > 0 && (
            <ul className={s.checks} style={{ marginTop: 14 }}>
              {tour.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          )}
        </section>

        {tour.itinerary.length > 0 && (
          <section className={s.section} aria-labelledby="itin-h">
            <h2 id="itin-h" className={s.h2}>
              {t.tour.itinerary}
            </h2>
            <ol className={s.steps}>
              {tour.itinerary.map((step) => (
                <li key={step.title}>
                  <b>{step.title}</b>
                  {step.text}
                </li>
              ))}
            </ol>
          </section>
        )}

        {(tour.included.length > 0 || tour.notIncluded.length > 0 || tour.bring.length > 0) && (
          <section className={s.section}>
            <div className={s.cols2}>
              {tour.included.length > 0 && (
                <div>
                  <h2 className={s.h3}>{t.tour.included}</h2>
                  <ul className={s.checks}>
                    {tour.included.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
              )}
              {tour.notIncluded.length > 0 && (
                <div>
                  <h2 className={s.h3}>{t.tour.notIncluded}</h2>
                  <ul className={`${s.checks} ${s.crosses}`}>
                    {tour.notIncluded.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {tour.bring.length > 0 && (
              <div className={s.bringBox} style={{ marginTop: 24 }}>
                <h2 className={s.h3}>{t.tour.bring}</h2>
                <ul className={`${s.checks} ${s.dots}`}>
                  {tour.bring.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {(tour.destinationCards.length > 0 || tour.goodToKnow.length > 0) && (
          <section className={s.section} aria-labelledby="know-h">
            <h2 id="know-h" className={s.h2}>
              {t.tour.goodToKnow}
            </h2>
            <div className={s.prose}>
              {[...tour.destinationCards, ...tour.goodToKnow].map((c) => (
                <p key={c.title}>
                  <b style={{ color: 'var(--c-ink)' }}>{c.title}.</b> {c.text}
                </p>
              ))}
            </div>
          </section>
        )}

        {tour.faq.length > 0 && (
          <section className={`${s.section} ${s.faq}`} aria-labelledby="faq-h">
            <h2 id="faq-h" className={s.h2}>
              {t.tour.faq}
            </h2>
            {tour.faq.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </section>
        )}

        <section className={s.section} id="book" aria-labelledby="book-h">
          <div className={s.bookBox}>
            <h2 id="book-h" className={s.h2}>
              {t.tour.book}
            </h2>
            <p className={s.sub} style={{ marginBottom: 0 }}>
              {t.tour.bookText}
            </p>
            <BookingForm tour={tour} locale={lang} t={t.booking} c={t.common} />
          </div>
        </section>

        {related.length > 0 && (
          <section className={s.section} aria-labelledby="rel-h">
            <h2 id="rel-h" className={s.h2}>
              {t.tour.related}
            </h2>
            <div className={s.tourList} style={{ marginTop: 16 }}>
              {related.map((r) => (
                <TourRow key={r.slug} tour={r} locale={lang} t={t.common} />
              ))}
            </div>
          </section>
        )}
      </article>
    </HydrationBoundary>
  );
}
