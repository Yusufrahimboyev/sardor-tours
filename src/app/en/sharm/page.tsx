import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { BottomNav } from '@/components/BottomNav';
import { Brand } from '@/components/Brand';
import { CountUp } from '@/components/CountUp';
import { CtaBand } from '@/components/CtaBand';
import { FaqList } from '@/components/FaqList';
import { Footer } from '@/components/Footer';
import { WhatsAppIcon } from '@/components/icons';
import { JsonLd, faqJsonLd } from '@/components/JsonLd';
import { ReviewsCarousel } from '@/components/ReviewsCarousel';
import { SupportWidget } from '@/components/SupportWidget';
import { TrustMarquee } from '@/components/TrustMarquee';
import { BOOK_TOUR_MSG, generalFaq, site, whatsappLink } from '@/data/site';
import { BESTSELLERS, collectReviews, getTour, MIN_PRICE, toSummary, tourHref, tours } from '@/data/tours';
import { imageSrc } from '@/lib/images';
import { Bestsellers } from './Bestsellers';
import { HeroSearch } from './HeroSearch';
import { ToursCatalog } from './ToursCatalog';
import { WorldMap } from './WorldMap';
import styles from './sharm.module.css';

const count = tours.length;

export const metadata: Metadata = {
  title: `${count}+ Best Sharm El Sheikh Excursions & Tours (Pay on Arrival)`,
  description: `Tours in Sharm El Sheikh from £${MIN_PRICE}. No prepayment. Book in 3 minutes. Hotel transfer included. English-speaking guides. Insurance included.`,
  alternates: { canonical: '/en/sharm/' },
  openGraph: {
    url: '/en/sharm/',
    title: 'Sharm El Sheikh Excursions & Day Trips',
    description: 'Boat trips, desert safaris, Cairo & Petra day trips. No prepayment, hotel transfer included.',
    images: [{ url: imageSrc('/images/hero1.webp', 1200, 630), width: 1200, height: 630 }],
  },
};

const BENEFITS = [
  { icon: '💰', title: 'Affordable Prices', text: `Amazing experiences from £${MIN_PRICE} per person with no hidden fees.` },
  { icon: '🤝', title: 'No Prepayment', text: 'Reserve today and pay on the day in GBP, USD, EUR or EGP.' },
  { icon: '⚡', title: 'Instant Booking', text: 'Book online in 3 minutes and get a booking reference straight away.' },
  { icon: '🚌', title: 'Free Hotel Transfer', text: 'Comfortable transfers included with every tour.' },
  { icon: '🗣️', title: 'Expert Guides', text: 'Every tour is led by an experienced English-speaking guide.' },
  { icon: '🛡️', title: 'Insurance Included', text: 'Every traveller is insured for the entire duration of the tour.' },
];

const PROMISE = [
  ['No prepayment', 'Pay on the day of your tour — in cash, in any currency'],
  ['No hidden fees', 'The final price includes everything — no surprises'],
  ['Hotel transfer', 'Free pickup and drop-off from any hotel'],
  ['24/7 support', 'A real person on WhatsApp, in English'],
  ['English-speaking guides', 'Professionals who love every route they lead'],
  ['17 years of experience', 'Since 2009. Over 150,000 happy travellers.'],
  ['Real offices', 'In Sharm El Sheikh and Cairo — real people'],
];

const STEPS = [
  ['Choose a tour', `${count}+ routes — sea, desert, history. Prices from £${MIN_PRICE}.`],
  ['Send a booking request', 'Pick a date and guests — we confirm on WhatsApp in minutes. No prepayment.'],
  ['We pick you up from your hotel', 'Guide, transfer and an unforgettable day — all included.'],
];

export default function SharmPage() {
  const summaries = tours.map(toSummary);
  const bestsellers = BESTSELLERS.map((b) => ({
    href: tourHref(b.slug),
    name: getTour(b.slug)!.name,
    tag: b.tag,
    image: b.image,
  }));
  const reviews = collectReviews(2, 14);

  return (
    <div className={styles.page}>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Sharm El Sheikh excursions',
          itemListElement: tours.map((t, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
              '@type': 'TouristTrip',
              name: t.name,
              url: `${site.url}${tourHref(t.slug)}`,
              touristType: t.categoryLabel,
              offers: { '@type': 'Offer', price: String(t.priceFrom), priceCurrency: 'GBP', availability: 'https://schema.org/InStock' },
            },
          })),
        }}
      />
      <JsonLd data={faqJsonLd(generalFaq)} />

      <section className={styles.hero}>
        <div className={styles.heroMedia}>
          <Image src={imageSrc('/images/hero1.webp', 1920, 1080)} alt="" fill priority sizes="100vw" />
        </div>
        <div className={styles.heroScrim} />
        <nav className={styles.heroNav} aria-label="Main">
          <Brand />
          <div className={styles.heroNavLinks}>
            <Link href="/">Destinations</Link>
            <Link href="/en/about-us/">About</Link>
            <a href={whatsappLink(BOOK_TOUR_MSG)} target="_blank" rel="noopener noreferrer" className={styles.heroNavWa}>
              <WhatsAppIcon size={16} />
              <span>WhatsApp</span>
            </a>
          </div>
        </nav>
        <div className={styles.heroBody} id="main-content" tabIndex={-1}>
          <h1 className={styles.heroH1}>
            <span>Sharm El Sheikh</span>
            <span className={styles.heroAccent}>Excursions</span>
          </h1>
          <p className={styles.heroLede}>
            <span className={styles.liveDot} aria-hidden />
            Experience the Best of Egypt with Us
          </p>
          <HeroSearch tours={summaries} />
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <div className={styles.heroAvs} aria-hidden>
                {['#ff9f5a', '#4f8cff', '#22c55e', '#f59e0b', '#a855f7'].map((c, i) => (
                  <span key={c} style={{ background: c }}>
                    {'JMSAL'[i]}
                  </span>
                ))}
              </div>
              <div>
                <div className={styles.heroStatNum}>
                  <span className={styles.star}>★</span> {site.stats.rating}/5
                </div>
                <div className={styles.heroStatLbl}>{site.stats.travellers} happy travellers</div>
              </div>
            </div>
            <div className={styles.heroStat}>
              <div>
                <div className={styles.heroStatNum}>from £{MIN_PRICE}</div>
                <div className={styles.heroStatLbl}>per person</div>
              </div>
            </div>
            <div className={styles.heroStat}>
              <div>
                <div className={styles.heroStatNum}>{site.stats.years}+ years</div>
                <div className={styles.heroStatLbl}>of experience</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.layout}>
        <main className={styles.left}>
          <section className={styles.benefits} aria-label="Benefits">
            {BENEFITS.map((b) => (
              <div key={b.title} className={styles.benefit}>
                <div className={styles.benefitIcon} aria-hidden>
                  {b.icon}
                </div>
                <h2 className={styles.benefitTitle}>{b.title}</h2>
                <p className={styles.benefitDesc}>{b.text}</p>
              </div>
            ))}
          </section>

          <section className={styles.bmSec} aria-labelledby="reviews-h">
            <div className={styles.bmHeadRow}>
              <div>
                <span className={styles.bmEyebrow}>reviews</span>
                <h2 id="reviews-h" className={styles.bmH}>
                  What they <span>say</span>
                </h2>
              </div>
              <div className={styles.ghostText} aria-hidden>
                +150k
              </div>
            </div>
            <TrustMarquee />
            <ReviewsCarousel reviews={reviews} />
          </section>

          <section className={styles.bsSec} aria-labelledby="bs-h">
            <div className={styles.bsHead}>
              <div>
                <div className={styles.secEyebrow}>Bestsellers</div>
                <h2 id="bs-h" className={styles.bsTitle}>
                  Bestselling Sharm El Sheikh Excursions
                </h2>
              </div>
              <a href="#tours" className={styles.allLink}>
                All tours →
              </a>
            </div>
            <Bestsellers items={bestsellers} />
          </section>

          <section className={styles.toursSec} id="tours" aria-labelledby="tours-h">
            <div className={styles.secEyebrow}>Our tours</div>
            <h2 id="tours-h" className={styles.secTitle}>
              Full List of Available Sharm El Sheikh
              <br />
              <span>Day Trips &amp; Excursions</span>
            </h2>
            <ToursCatalog tours={summaries} />
          </section>

          <section className={styles.rtSec} aria-label="Ratings">
            <div className={styles.rtBrand}>
              <span className={styles.rtBrandName}>SARDOR TOURS</span>
              <div className={styles.rtBrandDiv}>
                <span />
                SINCE 2009
                <span />
              </div>
            </div>
            <div className={styles.rtCard}>
              <div className={styles.rtScore}>
                <div className={styles.rtScoreNum}>{site.stats.rating}</div>
                <div>
                  <div className={styles.rtTag}>Excellent</div>
                  <div className={styles.rtStars} aria-hidden>
                    ★★★★★
                  </div>
                  <div className={styles.rtSub}>
                    Trusted by <b>{site.stats.travellers}</b> travellers
                  </div>
                </div>
              </div>
              <div className={styles.rtPlatforms}>
                {['Google', 'Tripadvisor', 'GetYourGuide'].map((p) => (
                  <div key={p} className={styles.rtPlat}>
                    <div className={styles.rtPlatName}>{p}</div>
                    <div className={styles.rtStars} aria-hidden>
                      ★★★★★
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.bmSec} id="faq" aria-labelledby="faq-h">
            <span className={styles.bmEyebrow}>FAQ</span>
            <h2 id="faq-h" className={styles.faqH}>
              Frequently asked <span>questions</span>
            </h2>
            <FaqList items={generalFaq} />
          </section>

          <section className={`${styles.bmSec} ${styles.bmAlt}`} aria-labelledby="promise-h">
            <div className={styles.bmHeadRow}>
              <div>
                <span className={styles.bmEyebrow}>our promise</span>
                <h2 id="promise-h" className={styles.bmH}>
                  No
                  <br />
                  <span>compromises</span>
                </h2>
              </div>
              <div className={`${styles.ghostText} ${styles.ghostFaint}`} aria-hidden>
                Since 2009
              </div>
            </div>
            <ol className={styles.whyList}>
              {PROMISE.map(([t, d], i) => (
                <li key={t} className={`${styles.whyRow} reveal`} style={{ transitionDelay: `${i * 60}ms` }}>
                  <span className={styles.whyN}>{String(i + 1).padStart(2, '0')}</span>
                  <span>
                    <b>{t}</b>
                    <small>{d}</small>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section className={styles.bmSec} aria-labelledby="steps-h">
            <span className={styles.bmEyebrow}>how to book</span>
            <div className={styles.bmHeadRow}>
              <h2 id="steps-h" className={styles.bmH}>
                Three
                <br />
                <span>steps</span>
              </h2>
              <div className={`${styles.ghostText} ${styles.ghostSm}`} aria-hidden>
                fast and easy
              </div>
            </div>
            <ol className={styles.steps}>
              {STEPS.map(([t, d], i) => (
                <li key={t} className={`${styles.step} reveal`}>
                  <span className={styles.stepN}>{i + 1}</span>
                  <span>
                    <b>{t}</b>
                    <small>{d}</small>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section className={styles.statsBanner} aria-label="Key figures">
            <div className={styles.stat}>
              <div className={styles.statN}>
                <CountUp value={17} suffix="+" />
              </div>
              <div className={styles.statL}>years</div>
            </div>
            <i />
            <div className={styles.stat}>
              <div className={styles.statN}>
                <CountUp value={150} suffix="k+" />
              </div>
              <div className={styles.statL}>travellers</div>
            </div>
            <i />
            <div className={styles.stat}>
              <div className={styles.statN}>
                <CountUp value={count} suffix="+" />
              </div>
              <div className={styles.statL}>tours</div>
            </div>
          </section>

          <section className={styles.mapSec} aria-labelledby="map-h">
            <span className={styles.bmEyebrow}>geography</span>
            <h2 id="map-h" className={`${styles.bmH} ${styles.onDark}`}>
              The world
              <br />
              flies to <span>us</span>
            </h2>
            <div className={styles.faces}>
              <div className={styles.heroAvs} aria-hidden>
                {['#ff9f5a', '#4f8cff', '#22c55e', '#f59e0b', '#a855f7'].map((c, i) => (
                  <span key={c} style={{ background: c }}>
                    {'EMSLR'[i]}
                  </span>
                ))}
              </div>
              <div className={styles.facesText}>
                +150,000
                <br />
                <span>travellers with us</span>
              </div>
            </div>
            <WorldMap />
          </section>
        </main>

        <aside className={styles.right} aria-label="Book a tour">
          <div className={styles.bookPanel}>
            <div className={styles.bookPanelTitle}>Book a Tour</div>
            <div className={styles.bookPanelSub}>We reply in 3 minutes</div>
            <div className={styles.bookPanelPrice}>
              from <span>£{MIN_PRICE}</span> / person
            </div>
            <ul className={styles.bookPanelBenefits}>
              {['No prepayment', 'Hotel transfer included', 'Book in 3 minutes', 'English-speaking guides', 'Insurance included'].map(
                (b) => (
                  <li key={b}>
                    <span aria-hidden>✓</span> {b}
                  </li>
                ),
              )}
            </ul>
            <a href="#tours" className={styles.bookPanelCta}>
              Choose your tour
            </a>
            <a href={whatsappLink(BOOK_TOUR_MSG)} target="_blank" rel="noopener noreferrer" className={styles.bookPanelWa}>
              <WhatsAppIcon /> Message us on WhatsApp
            </a>
            <div className={styles.bookPanelNote}>Instant booking reference. We reply fast.</div>
          </div>
        </aside>
      </div>

      <CtaBand />
      <Footer />
      <BottomNav tours={summaries} revealAfter={500} />
      <SupportWidget />
    </div>
  );
}
