import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { BottomNav } from '@/components/BottomNav';
import { BookingForm } from '@/components/booking/BookingForm';
import { BookButton, BookingLauncher } from '@/components/booking/BookingLauncher';
import { FaqList } from '@/components/FaqList';
import { Footer } from '@/components/Footer';
import { CalendarIcon, CheckIcon, ClockIcon, ShieldIcon, WhatsAppIcon } from '@/components/icons';
import { JsonLd, faqJsonLd } from '@/components/JsonLd';
import { SupportWidget } from '@/components/SupportWidget';
import { site, whatsappLink } from '@/data/site';
import { tourHref } from '@/data/categories';
import { allTours, getTour, toSummary, tourSlugs } from '@/data/tours';
import { langFrom } from '@/i18n/params';
import { localeHref } from '@/i18n/routing';
import { imageSrc, usingPlaceholders } from '@/lib/images';
import { Gallery } from './Gallery';
import { IncludedTabs } from './IncludedTabs';
import styles from './tour.module.css';

// Unknown slugs never reach the page: they 404 through app/global-not-found.tsx (server-rendered).
export const dynamicParams = false;

export function generateStaticParams() {
  return tourSlugs.map((slug) => ({ slug }));
}

type Params = { params: Promise<{ lang: string; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const lang = await langFrom(params);
  const tour = getTour((await params).slug, lang);
  if (!tour) return {};
  const title = tour.metaTitle.replace(/\s*\|\s*Sardor Tours$/, '');
  return {
    title,
    description: tour.metaDescription,
    alternates: { canonical: tourHref(lang, tour.slug) },
    openGraph: {
      type: 'article',
      url: tourHref(lang, tour.slug),
      title,
      description: tour.metaDescription,
      images: [{ url: imageSrc(tour.cardImage, 1200, 630), width: 1200, height: 630, alt: tour.name }],
    },
  };
}

export default async function TourPage({ params }: Params) {
  const lang = await langFrom(params);
  const tour = getTour((await params).slug, lang);
  if (!tour) notFound();

  const gallery = usingPlaceholders ? tour.gallery.slice(0, 8) : tour.gallery;
  const oldPrice = tour.heroPrices[0]?.oldPrice ?? tour.bento.oldPrice;
  const discount = tour.heroPrices[0]?.discount ?? null;
  const related = tour.related.map((r) => ({ ...r, tour: getTour(r.slug, lang)! }));
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
          provider: { '@type': 'TravelAgency', name: site.name, url: site.url },
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${site.url}/` },
            { '@type': 'ListItem', position: 2, name: 'Sharm El Sheikh', item: `${site.url}${localeHref(lang, '/sharm/')}` },
            { '@type': 'ListItem', position: 3, name: tour.name, item: `${site.url}${tourHref(lang, tour.slug)}` },
          ],
        }}
      />
      {tour.faq.length > 0 && <JsonLd data={faqJsonLd(tour.faq)} />}

      <BottomNav lang={lang} tours={allTours(lang).map(toSummary)} withBack placement="top" />

      <div className={styles.shell}>
        <main id="main-content" tabIndex={-1} className={styles.main}>
          <nav aria-label="Breadcrumb" className={styles.crumbs}>
            <Link href={localeHref(lang, '/')}>Home</Link> <span aria-hidden>/</span> <Link href={localeHref(lang, '/sharm/')}>Sharm El Sheikh</Link>{' '}
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
              {tour.heroPrices.map((p) => (
                <div key={p.label} className={styles.priceRow}>
                  <div className={styles.priceVal}>£{p.price}</div>
                  <div className={styles.priceLbl}>
                    <b>{p.label}</b>
                    {p.unit && <small>{p.unit}</small>}
                  </div>
                  {p.oldPrice && (
                    <div className={styles.priceOld}>
                      <s>£{p.oldPrice}</s>
                      {p.discount && <span>{p.discount}</span>}
                    </div>
                  )}
                </div>
              ))}
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
              <IncludedTabs included={tour.included} notIncluded={tour.notIncluded} bring={tour.bring} />
            </div>
          </section>

          {tour.faq.length > 0 && (
            <section className={styles.block} aria-labelledby="faq-h">
              <h2 id="faq-h" className={styles.h2}>
                Frequently asked <span className={styles.accent}>questions</span>
              </h2>
              <FaqList items={tour.faq} />
            </section>
          )}

          <section className={styles.info} aria-labelledby="info-h">
            <div className={styles.infoEyebrow}>Additional information</div>
            <h2 id="info-h" className={styles.h2}>
              {tour.infoHeading}
            </h2>
            <div className={styles.dirGrid}>
              {tour.destinationCards.map((c) => (
                <div key={c.title} className={styles.dirCard}>
                  <span className={`${styles.chip} ${styles[`tone_${c.tone ?? 'blue'}`]}`}>{c.tag}</span>
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                </div>
              ))}
            </div>
            {tour.goodToKnow.length > 0 && (
              <>
                <div className={`${styles.infoEyebrow} ${styles.green}`}>Good to know</div>
                <div className={styles.dirGrid}>
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
              </div>
              <div className={`${styles.bc} ${styles.bcB}`}>
                <div>
                  <div className={`${styles.bcKicker} ${styles.teal}`}>{tour.bento.programKicker}</div>
                  <div className={styles.bcNum}>{tour.bento.programNum}</div>
                  <p className={styles.bcDesc}>{tour.bento.programText}</p>
                </div>
                {tour.bento.ring && (
                  <div className={styles.ring} aria-hidden>
                    <b>{tour.bento.ring}</b>
                    <small>{tour.bento.ringLabel}</small>
                  </div>
                )}
              </div>
              <div className={`${styles.bc} ${styles.bcC}`}>
                <div className={styles.bcKicker}>Pay on the day</div>
                <div className={styles.bcBig}>
                  £0
                  <br />
                  upfront
                </div>
                <p className={styles.bcDesc}>
                  Reserve online in 3 minutes. <b>Hotel transfer included</b>, free cancellation up to 24 hours before.
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
            <div className={styles.kicker}>Other tours</div>
            <h2 id="rel-h" className={styles.h2}>
              You might also like
            </h2>
            <div className={styles.relTrack}>
              {related.map((r) => (
                <Link key={r.slug} href={tourHref(lang, r.slug)} className={styles.relCard}>
                  <Image src={imageSrc(r.tour.cardImage, 700, 900)} alt="" fill sizes="(max-width: 700px) 70vw, 260px" />
                  <span className={styles.relGrad} />
                  <span className={styles.relBody}>
                    <span className={styles.relTag}>{r.tag}</span>
                    <span className={styles.relName}>{r.name}</span>
                    <span className={styles.relBtn}>Details · from £{r.tour.priceFrom}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </main>

        <aside className={styles.sidebar} aria-label="Book this tour">
          <div className={styles.sideCard}>
            <div className={styles.sideHead}>
              <div className={styles.sideTitle}>Book your spot</div>
              <div className={styles.sidePrice}>
                from <b>£{tour.priceFrom}</b>
                {oldPrice && <s>£{oldPrice}</s>}
                {discount && <span>{discount}</span>}
              </div>
              <a
                className={styles.sideWa}
                href={whatsappLink(`Hello! I have a question about: ${tour.name}`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon size={14} /> Questions? Ask us on WhatsApp
              </a>
            </div>
            <div className={styles.sideBody}>
              <BookingForm lang={lang} tour={tour} />
            </div>
          </div>
        </aside>
      </div>

      <Footer lang={lang} tone="light" />
      <BookingLauncher lang={lang} tour={tour} oldPrice={oldPrice} />
      <SupportWidget />
    </div>
  );
}
