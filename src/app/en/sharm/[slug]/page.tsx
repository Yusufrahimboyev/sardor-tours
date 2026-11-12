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
import { toSummary, tourHref, type Tour } from '@/data/tours';
import { getTour, listTours } from '@/lib/server/tours';
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
  return (await listTours()).map((t) => ({ slug: t.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const tour = await getTour((await params).slug);
  if (!tour) return {};
  const title = tour.metaTitle.replace(/\s*\|\s*Sardor Tours$/, '');
  return {
    title,
    description: tour.metaDescription,
    alternates: { canonical: tourHref(tour.slug) },
    openGraph: {
      type: 'article',
      url: tourHref(tour.slug),
      title,
      description: tour.metaDescription,
      images: [{ url: imageSrc(tour.cardImage, 1200, 630), width: 1200, height: 630, alt: tour.name }],
    },
  };
}

export default async function TourPage({ params }: Params) {
  const tour = await getTour((await params).slug);
  if (!tour) notFound();
  const tours = await listTours();
  const bySlug = new Map(tours.map((t) => [t.slug, t]));

  const gallery = usingPlaceholders ? tour.gallery.slice(0, 8) : tour.gallery;
  const oldPrice = tour.heroPrices[0]?.oldPrice ?? tour.bento.oldPrice;
  const discount = tour.heroPrices[0]?.discount ?? tour.bento.badge ?? null;
  const related = tour.related
    .filter((r) => bySlug.has(r.slug))
    .map((r) => ({ ...r, tour: bySlug.get(r.slug) as Tour }));
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
          url: `${site.url}${tourHref(tour.slug)}`,
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
            url: `${site.url}${tourHref(tour.slug)}`,
          },
          provider: { '@type': 'TravelAgency', name: site.name, url: site.url },
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${site.url}/` },
            { '@type': 'ListItem', position: 2, name: 'Sharm El Sheikh', item: `${site.url}/en/sharm/` },
            { '@type': 'ListItem', position: 3, name: tour.name, item: `${site.url}${tourHref(tour.slug)}` },
          ],
        }}
      />
      {tour.faq.length > 0 && <JsonLd data={faqJsonLd(tour.faq)} />}

      <BottomNav tours={tours.map(toSummary)} withBack placement="top" />

      <div className={styles.shell}>
        <main id="main-content" tabIndex={-1} className={styles.main}>
          <nav aria-label="Breadcrumb" className={`${styles.crumbs} sr-only`}>
            <Link href="/">Home</Link> <span aria-hidden>/</span> <Link href="/en/sharm/">Sharm El Sheikh</Link>{' '}
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
                const child = /^Children\s+(.+)$/.exec(p.label);
                const old = p.oldPrice ?? (i === 0 ? oldPrice : null);
                const off = p.discount ?? (i === 0 ? discount : null);
                return (
                  <div key={p.label} className={styles.priceRow}>
                    <div className={styles.priceVal}>£{p.price}</div>
                    <div className={styles.priceLbl}>
                      <b>{child ? 'Child' : i === 0 && p.label === 'Adults' ? 'Adult' : p.label}</b>
                      {(child || p.unit) && <small>{[child?.[1], p.unit].filter(Boolean).join(' · ')}</small>}
                    </div>
                    {old && (
                      <div className={styles.priceOld}>
                        <s>£{old}</s>
                        {off && <span>{off}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
              <div className={styles.payNote}>
                <ShieldIcon size={16} /> Book now, pay on the day of the tour
              </div>
            </div>
          </section>

          <ul className={styles.bridge} aria-label="Highlights">
            {tour.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>

          <TravellerReviews />

          <section className={styles.block} aria-labelledby="itin-h">
            <div className={styles.kicker}>What you get</div>
            <h2 id="itin-h" className={styles.h2}>
              Tour Itinerary
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
              <IncludedBoxes included={tour.included} notIncluded={tour.notIncluded} bring={tour.bring} />
            </div>
          </section>

          <ReviewsSection className={styles.reviewsSec} />

          {tour.faq.length > 0 && (
            <section className={styles.block} aria-labelledby="faq-h">
              <h2 id="faq-h" className={styles.h2}>
                Frequently asked <span className={styles.accent}>questions</span>
              </h2>
              <FaqList items={tour.faq} variant="soft" />
            </section>
          )}

          {(tour.destinationCards.length > 0 || tour.goodToKnow.length > 0) && (
          <section className={styles.info} aria-labelledby="info-h">
            <div className={styles.infoEyebrow}>Additional information</div>
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
                <div className={`${styles.infoEyebrow} ${styles.green}`}>Good to know</div>
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
                <i aria-hidden /> Sardor Tours
              </div>
              <h2 id="wcu-h" className={styles.wcuH}>
                Why choose <em>us?</em>
              </h2>
            </div>
            <div className={styles.bento}>
              <div className={`${styles.bc} ${styles.bcA}`}>
                <div className={styles.bcKicker}>{tour.bento.priceKicker ?? 'Tour price'}</div>
                <div className={styles.bcPrice}>£{tour.priceFrom}</div>
                {(tour.bento.oldPrice || tour.bento.badge) && (
                  <div className={styles.bcWas}>
                    {tour.bento.oldPrice && <s>£{tour.bento.oldPrice}</s>}
                    {tour.bento.badge && <span>{tour.bento.badge}</span>}
                  </div>
                )}
                <p className={styles.bcDesc}>{tour.bento.priceText}</p>
                {tour.bento.oldPrice && tour.bento.oldPrice > tour.priceFrom && (
                  <div className={styles.bcBar}>
                    <div className={styles.bcBarHead}>
                      <span>Your discount</span>
                      <b>
                        {tour.bento.badge ? `${tour.bento.badge} · ` : ''}save £{tour.bento.oldPrice - tour.priceFrom}
                      </b>
                    </div>
                    <div className={styles.bcBarTrack}>
                      <i style={{ width: `${Math.round((tour.priceFrom / tour.bento.oldPrice) * 100)}%` }} />
                    </div>
                    <div className={styles.bcBarEnds}>
                      <span>£0</span>
                      <span>£{tour.bento.oldPrice}</span>
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
                <div className={styles.bcKicker}>Reliability</div>
                <div className={styles.bcBig}>
                  {site.stats.years}
                  <br />
                  years
                </div>
                <p className={styles.bcDesc}>
                  {site.since && (
                    <>
                      In business since <b>{site.since}</b>.<br />
                    </>
                  )}
                  More than <b>{site.stats.travellers} travellers</b>
                  <br />
                  in Egypt.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.cta} aria-labelledby="cta-h">
            <h2 id="cta-h">{tour.cta.heading ?? 'Ready for an unforgettable day?'}</h2>
            <p>
              {tour.cta.line1}
              <br />
              {tour.cta.line2}
            </p>
            <BookButton className={styles.ctaBtn}>
              <CheckIcon size={18} /> Book this tour
            </BookButton>
            <div className={styles.ctaChips}>
              {(tour.cta.chips.length ? tour.cta.chips : ['£0 prepayment', 'Free cancellation', 'We reply fast']).map((c) => (
                <span key={c}>
                  <CheckIcon size={13} /> {c}
                </span>
              ))}
            </div>
          </section>

          <section className={styles.related} aria-labelledby="rel-h">
            <div className={styles.relKicker}>Other tours</div>
            <h2 id="rel-h" className={styles.relH}>
              You might also like
            </h2>
            <Bestsellers
              variant="related"
              items={related.map((r) => ({ href: tourHref(r.slug), name: r.name, tag: r.tag, image: r.tour.cardImage }))}
            />
          </section>
        </main>

        <aside className={styles.sidebar} aria-label="Book this tour">
          <div className={styles.sideCard}>
            <div className={styles.sideHead}>
              <div className={styles.sideHeadRow}>
                <div className={styles.sideTitle}>Book your spot</div>
                <a
                  className={styles.sideTeam}
                  href={whatsappLink(`Hello! I have a question about: ${tour.name}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Ask our team on WhatsApp"
                >
                  <span className={styles.sideAvs} aria-hidden>
                    {TEAM.map((t) => (
                      <span key={t.i} style={{ background: t.bg }}>
                        {t.i}
                      </span>
                    ))}
                  </span>
                  <span>
                    <b>Team online</b>
                    <small>
                      <i aria-hidden /> Fast replies
                    </small>
                  </span>
                </a>
              </div>
              <div className={styles.sidePills}>
                <span className={styles.pillGreen}>
                  <i aria-hidden /> No prepayment
                </span>
                <span className={styles.pillOrange}>⚡ Free cancellation 24h</span>
              </div>
            </div>
            <div className={styles.sidePrices}>
              <span className={styles.sidePricesBar} aria-hidden />
              {tour.heroPrices.slice(0, 2).map((p, i) => (
                <div key={p.label} className={styles.sidePriceCol}>
                  {i > 0 && <span className={styles.sidePriceDiv} aria-hidden />}
                  <div>
                    <small>{i === 0 ? 'Adult' : p.label.replace(/^Children/, 'Child')}</small>
                    <b>£{p.price}</b>
                  </div>
                </div>
              ))}
              {oldPrice && (
                <div className={styles.sidePriceOld}>
                  <s>£{oldPrice}</s>
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

      <Footer stats />
      <BookingLauncher tour={tour} oldPrice={oldPrice} />
      <SupportWidget />
    </div>
  );
}
