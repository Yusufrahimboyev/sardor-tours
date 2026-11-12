import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { BottomNav } from '@/components/BottomNav';
import { BookingForm } from '@/components/booking/BookingForm';
import { BookButton, BookingLauncher } from '@/components/booking/BookingLauncher';
import { FaqList } from '@/components/FaqList';
import { Footer } from '@/components/Footer';
import { CalendarIcon, CheckIcon, ClockIcon, ShieldIcon } from '@/components/icons';
import { JsonLd, faqJsonLd } from '@/components/JsonLd';
import { ReviewsSection } from '@/components/reviews/ReviewsSection';
import { SupportWidget } from '@/components/SupportWidget';
import { site, whatsappLink } from '@/data/site';
import { tourHref } from '@/data/categories';
import { toSummary } from '@/data/tours';
import { getTour, listTours } from '@/lib/server/tours';
import { formatPrice } from '@/i18n/format';
import { pageAlternates, pageOpenGraph } from '@/i18n/metadata';
import { getList, getT } from '@/i18n/messages';
import { langFrom } from '@/i18n/params';
import { localeHref } from '@/i18n/routing';
import { imageSrc, usingPlaceholders } from '@/lib/images';
import { Bestsellers } from '../Bestsellers';
import { Gallery } from './Gallery';
import { IncludedBoxes } from './IncludedBoxes';
import { TravellerReviews } from './TravellerReviews';
import styles from './tour.module.css';

/** Tours added in the admin panel after the build render on first request. */
export const dynamicParams = true;

/** Initials shown as the "team online" avatars in the booking panel. */
const TEAM = [
  { i: 'S', bg: 'linear-gradient(135deg,#ff8a3d,#e85d04)' },
  { i: 'Y', bg: 'linear-gradient(135deg,#38bdf8,#0369a1)' },
  { i: 'M', bg: 'linear-gradient(135deg,#f472b6,#be185d)' },
];

export async function generateStaticParams() {
  return (await listTours()).map(({ slug }) => ({ slug }));
}

type Params = { params: Promise<{ lang: string; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const lang = await langFrom(params);
  const tour = await getTour((await params).slug, { lang });
  if (!tour) return {};
  const title = tour.metaTitle.replace(/\s*\|\s*Sardor Tours$/, '');
  return {
    title,
    description: tour.metaDescription,
    alternates: pageAlternates(lang, `/sharm/${tour.slug}/`),
    openGraph: pageOpenGraph(lang, `/sharm/${tour.slug}/`, {
      type: 'article',
      title,
      description: tour.metaDescription,
      images: [{ url: imageSrc(tour.cardImage, 1200, 630), width: 1200, height: 630, alt: tour.name }],
    }),
  };
}

export default async function TourPage({ params }: Params) {
  const lang = await langFrom(params);
  const tour = await getTour((await params).slug, { lang });
  if (!tour) notFound();
  const t = getT(lang);
  const price = (n: number) => formatPrice(n, lang);

  const gallery = usingPlaceholders ? tour.gallery.slice(0, 8) : tour.gallery;
  const oldPrice = tour.heroPrices[0]?.oldPrice ?? tour.bento.oldPrice;
  const discount = tour.heroPrices[0]?.discount ?? tour.bento.badge ?? null;
  const tours = await listTours({ lang });
  const bySlug = new Map(tours.map((x) => [x.slug, x]));
  const related = tour.related.flatMap((r) => {
    const match = bySlug.get(r.slug);
    return match ? [{ ...r, tour: match }] : [];
  });
  const programNum = (tour.bento.programNum ?? '').split(' ');
  const meta = [tour.schedule, tour.detailDuration, tour.timeText].filter(Boolean) as string[];

  return (
    <div className={styles.page}>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'TouristTrip',
          name: tour.title,
          description: tour.metaDescription,
          url: `${site.url}${tourHref(lang, tour.slug)}`,
          image: imageSrc(tour.cardImage, 1200, 800),
          touristType: tour.categoryLabel,
          itinerary: {
            '@type': 'ItemList',
            itemListElement: tour.itinerary.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: s.title, description: s.text })),
          },
          offers: {
            '@type': 'Offer',
            price: String(tour.priceFrom),
            priceCurrency: 'GBP',
            availability: 'https://schema.org/InStock',
            url: `${site.url}${tourHref(lang, tour.slug)}`,
          },
          inLanguage: lang,
          provider: { '@type': 'TravelAgency', name: site.name, url: site.url },
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: t('tour.jsonLd.home'), item: `${site.url}${localeHref(lang, '/')}` },
            { '@type': 'ListItem', position: 2, name: t('tour.jsonLd.sharm'), item: `${site.url}${localeHref(lang, '/sharm/')}` },
            { '@type': 'ListItem', position: 3, name: tour.name, item: `${site.url}${tourHref(lang, tour.slug)}` },
          ],
        }}
      />
      {tour.faq.length > 0 && <JsonLd data={faqJsonLd(tour.faq, lang)} />}

      <BottomNav tours={tours.map(toSummary)} withBack placement="top" />

      <div className={styles.shell}>
        <main id="main-content" tabIndex={-1} className={styles.main}>
          <nav aria-label={t('tour.breadcrumb.aria')} className={`${styles.crumbs} sr-only`}>
            <Link href={localeHref(lang, '/')}>{t('tour.breadcrumb.home')}</Link> <span aria-hidden>/</span> <Link href={localeHref(lang, '/sharm/')}>{t('tour.breadcrumb.sharm')}</Link>{' '}
            <span aria-hidden>/</span> <span aria-current="page">{tour.name}</span>
          </nav>

          <Gallery images={gallery} alt={tour.name} />

          <section className={styles.hero}>
            <h1 className={styles.h1}>{tour.title}</h1>
            <div className={styles.meta}>
              {meta.map((m, i) => (
                <span key={m}>
                  {i === 0 ? <CalendarIcon size={15} /> : <ClockIcon size={15} />}
                  {m}
                </span>
              ))}
            </div>
            <div className={styles.prices}>
              {tour.heroPrices.map((p, i) => {
                const old = p.oldPrice ?? (i === 0 ? oldPrice : null);
                const off = p.discount ?? (i === 0 ? discount : null);
                return (
                  <div key={p.label} className={styles.priceRow}>
                    <div className={styles.priceVal}>{price(p.price)}</div>
                    <div className={styles.priceLbl}>
                      <b>{p.label}</b>
                      {p.unit && <small>{p.unit}</small>}
                    </div>
                    {old && (
                      <div className={styles.priceOld}>
                        <s>{price(old)}</s>
                        {off && <span>{off}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
              <div className={styles.payNote}>
                <ShieldIcon size={16} /> {t('tour.payNote')}
              </div>
            </div>
          </section>

          <ul className={styles.bridge} aria-label={t('tour.highlightsAria')}>
            {tour.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>

          <TravellerReviews lang={lang} />

          <section className={styles.block} aria-labelledby="itin-h">
            <div className={styles.kicker}>{t('tour.itinKicker')}</div>
            <h2 id="itin-h" className={styles.h2}>
              {t('tour.itinTitle')}
            </h2>
            <div className={styles.itinCard}>
              <ol className={styles.itin}>
                {tour.itinerary.map((s) => (
                  <li key={s.title} className="reveal">
                    <b>{s.title}</b>
                    <p>{s.text}</p>
                  </li>
                ))}
              </ol>
              <IncludedBoxes lang={lang} included={tour.included} notIncluded={tour.notIncluded} bring={tour.bring} />
            </div>
          </section>

          <ReviewsSection lang={lang} className={styles.reviewsSec} />

          {tour.faq.length > 0 && (
            <section className={styles.block} aria-labelledby="faq-h">
              <h2 id="faq-h" className={styles.h2}>
                {t('tour.faq.before')}<span className={styles.accent}>{t('tour.faq.em')}</span>
              </h2>
              <FaqList items={tour.faq} variant="soft" />
            </section>
          )}

          {(tour.destinationCards.length > 0 || tour.goodToKnow.length > 0) && (
          <section className={styles.info} aria-labelledby="info-h">
            <div className={styles.infoEyebrow}>{t('tour.infoEyebrow')}</div>
            <h2 id="info-h" className={styles.h2}>
              {tour.infoHeading}
            </h2>
            <div className={styles.dirGrid}>
              {tour.destinationCards.map((c) => (
                <div key={c.title} className={styles.dirCard}>
                  <span className={`${styles.chip} ${styles.tone_blue}`}>{c.tag}</span>
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                </div>
              ))}
            </div>
            {tour.goodToKnow.length > 0 && (
              <>
                <div className={`${styles.infoEyebrow} ${styles.green}`}>{t('tour.goodToKnow')}</div>
                <div className={styles.knowGrid}>
                  {tour.goodToKnow.map((c) => (
                    <div key={c.title} className={styles.knowCard}>
                      <h3>{c.title}</h3>
                      <p>{c.text}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
          )}

          <section className={styles.wcu} aria-labelledby="wcu-h">
            <div className={styles.wcuTop}>
              <div className={styles.wcuEyebrow}>
                <i aria-hidden /> {site.name}
              </div>
              <h2 id="wcu-h" className={styles.wcuH}>
                {t('tour.wcu.before')}<em>{t('tour.wcu.em')}</em>
              </h2>
            </div>
            <div className={styles.bento}>
              <div className={`${styles.bc} ${styles.bcA}`}>
                <div className={styles.bcKicker}>{tour.bento.priceKicker ?? t('tour.priceKicker')}</div>
                <div className={styles.bcPrice}>{price(tour.priceFrom)}</div>
                {(tour.bento.oldPrice || tour.bento.badge) && (
                  <div className={styles.bcWas}>
                    {tour.bento.oldPrice && <s>{price(tour.bento.oldPrice)}</s>}
                    {tour.bento.badge && <span>{tour.bento.badge}</span>}
                  </div>
                )}
                <p className={styles.bcDesc}>{tour.bento.priceText}</p>
                {tour.bento.oldPrice && tour.bento.oldPrice > tour.priceFrom && (
                  <div className={styles.bcBar}>
                    <div className={styles.bcBarHead}>
                      <span>{t('tour.discount.label')}</span>
                      <b>
                        {tour.bento.badge ? `${tour.bento.badge} · ` : ''}
                        {t('tour.discount.save', { amount: price(tour.bento.oldPrice - tour.priceFrom) })}
                      </b>
                    </div>
                    <div className={styles.bcBarTrack}>
                      <i style={{ width: `${Math.round((tour.priceFrom / tour.bento.oldPrice) * 100)}%` }} />
                    </div>
                    <div className={styles.bcBarEnds}>
                      <span>{price(0)}</span>
                      <span>{price(tour.bento.oldPrice)}</span>
                    </div>
                  </div>
                )}
              </div>
              {tour.bento.programText && (
              <div className={`${styles.bc} ${styles.bcB}`}>
                <div>
                  <div className={`${styles.bcKicker} ${styles.teal}`}>{tour.bento.programKicker}</div>
                  <div className={styles.bcNum}>
                    {programNum[0]} <span>{programNum.slice(1).join(' ')}</span>
                  </div>
                  <p className={styles.bcDesc}>{tour.bento.programText}</p>
                </div>
                {tour.bento.ring && (
                  <div className={styles.ring} aria-hidden>
                    <svg viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" className={styles.ringTrack} />
                      <circle cx="50" cy="50" r="45" className={styles.ringFill} />
                    </svg>
                    <span>
                      <b>{tour.bento.ring}</b>
                      <small>{tour.bento.ringLabel}</small>
                    </span>
                  </div>
                )}
              </div>
              )}
              <div className={`${styles.bc} ${styles.bcC}`}>
                <div className={styles.bcKicker}>{t('tour.reliability.kicker')}</div>
                <div className={styles.bcBig}>
                  {site.stats.years}
                  <br />
                  {t('tour.reliability.years')}
                </div>
                <p className={styles.bcDesc}>
                  {site.since && (
                    <>
                      {t('tour.reliability.since', { year: site.since })}
                      <br />
                    </>
                  )}
                  {t('tour.reliability.travellers', { n: site.stats.travellers.replace(/\+$/, '') })}
                </p>
              </div>
            </div>
          </section>

          <section className={styles.cta} aria-labelledby="cta-h">
            <h2 id="cta-h">{tour.cta.heading ?? t('tour.cta.heading')}</h2>
            <p>
              {tour.cta.line1}
              <br />
              {tour.cta.line2}
            </p>
            <BookButton className={styles.ctaBtn}>
              <CheckIcon size={18} /> {t('tour.cta.book')}
            </BookButton>
            <div className={styles.ctaChips}>
              {(tour.cta.chips.length ? tour.cta.chips : getList<string[]>(lang, 'tour.cta.chips')).map((c) => (
                <span key={c}>
                  <CheckIcon size={13} /> {c}
                </span>
              ))}
            </div>
          </section>

          <section className={styles.related} aria-labelledby="rel-h">
            <div className={styles.relKicker}>{t('tour.related.kicker')}</div>
            <h2 id="rel-h" className={styles.relH}>
              {t('tour.related.title')}
            </h2>
            <Bestsellers variant="related" items={related.map((r) => ({ href: tourHref(lang, r.slug), name: r.tour.name, tag: r.tag, image: r.tour.cardImage }))} />
          </section>
        </main>

        <aside className={styles.sidebar} aria-label={t('tour.side.aria')}>
          <div className={styles.sideCard}>
            <div className={styles.sideHead}>
              <div className={styles.sideHeadRow}>
                <div className={styles.sideTitle}>{t('tour.side.title')}</div>
                <a
                  className={styles.sideTeam}
                  href={whatsappLink(t('client.whatsapp.tourQuestion', { name: tour.name }))}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t('tour.side.askAria')}
                >
                  <span className={styles.sideAvs} aria-hidden>
                    {TEAM.map((m) => (
                      <span key={m.i} style={{ background: m.bg }}>
                        {m.i}
                      </span>
                    ))}
                  </span>
                  <span>
                    <b>{t('tour.side.teamOnline')}</b>
                    <small>
                      <i aria-hidden /> {t('tour.side.fastReplies')}
                    </small>
                  </span>
                </a>
              </div>
              <div className={styles.sidePills}>
                <span className={styles.pillGreen}>
                  <i aria-hidden /> {t('tour.side.noPrepay')}
                </span>
                <span className={styles.pillOrange}>⚡ {t('tour.side.freeCancel')}</span>
              </div>
            </div>
            <div className={styles.sidePrices}>
              <span className={styles.sidePricesBar} aria-hidden />
              {tour.heroPrices.slice(0, 2).map((p, i) => (
                <div key={p.label} className={styles.sidePriceCol}>
                  {i > 0 && <span className={styles.sidePriceDiv} aria-hidden />}
                  <div>
                    <small>{p.label}</small>
                    <b>{price(p.price)}</b>
                  </div>
                </div>
              ))}
              {oldPrice && (
                <div className={styles.sidePriceOld}>
                  <s>{price(oldPrice)}</s>
                  {discount && <span>{discount}</span>}
                </div>
              )}
            </div>
            <div className={styles.sideBody}>
              <BookingForm tour={tour} single />
            </div>
          </div>
        </aside>
      </div>

      <Footer lang={lang} stats />
      <BookingLauncher tour={tour} oldPrice={oldPrice} />
      <SupportWidget />
    </div>
  );
}
