import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { CtaBand } from '@/components/CtaBand';
import { Footer } from '@/components/Footer';
import { ArrowDown, ArrowRight, WhatsAppIcon } from '@/components/icons';
import { JsonLd, faqJsonLd } from '@/components/JsonLd';
import { ReviewsCarousel } from '@/components/ReviewsCarousel';
import { destinations, generalFaq, PLAN_TRIP_MSG, site, whatsappLink } from '@/data/site';
import { collectReviews, tours } from '@/data/tours';
import { imageSrc } from '@/lib/images';
import { HomeHeader } from './HomeHeader';
import styles from './home.module.css';

export const metadata: Metadata = {
  title: { absolute: `${site.name} — Egypt Excursions in Sharm El Sheikh, Hurghada, Cairo & Marsa Alam` },
  description:
    'Sardor Tours — a family-run Egyptian tour operator since 2009. Excursions across Sharm El Sheikh, Hurghada, Cairo and Marsa Alam. 150,000+ happy travellers, no prepayment, hotel transfer included.',
  alternates: { canonical: '/' },
  openGraph: {
    url: '/',
    title: `${site.name} — Egypt Excursions`,
    description: 'Family-run Egyptian tour operator since 2009. No prepayment · hotel transfer included.',
    images: [{ url: imageSrc('/images/hero1.webp', 1200, 630), width: 1200, height: 630 }],
  },
};

const WHY = [
  {
    title: 'No prepayment',
    text: 'Reserve in 3 minutes — no prepayment required. Pay on the day of your tour.',
    icon: <path d="M20 6 9 17l-5-5" />,
  },
  {
    title: 'Hotel transfer included',
    text: "We collect you from your hotel's main gate and bring you back — free, air-conditioned.",
    icon: (
      <>
        <path d="M5 11l2-7h10l2 7M5 11h14M5 11v6h14v-6M7 17v2M17 17v2" />
        <circle cx="8" cy="14" r="1.4" />
        <circle cx="16" cy="14" r="1.4" />
      </>
    ),
  },
  {
    title: 'Licensed & insured',
    text: "Fully certified by Egypt's tourism authority. Every guest insured for the whole trip.",
    icon: (
      <>
        <path d="M12 2 4 5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
  },
  {
    title: '24/7 support',
    text: 'A real person answers on WhatsApp around the clock — in English, Russian, Italian & Turkish.',
    icon: <path d="M21 11.5a8.38 8.38 0 0 1-9 8.4 8.5 8.5 0 0 1-3.8-.9L3 20l1.3-3.8A8.38 8.38 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z" />,
  },
];

export default function HomePage() {
  const wa = whatsappLink(PLAN_TRIP_MSG);
  const reviews = collectReviews(1, 12);
  const liveCount = tours.length;

  return (
    <div className={styles.page}>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'TravelAgency',
          name: site.name,
          url: site.url,
          description: site.description,
          telephone: `+${site.whatsappNumber}`,
          email: site.email,
          priceRange: '£',
          foundingDate: '2009',
          areaServed: ['Sharm El Sheikh', 'Hurghada', 'Cairo', 'Marsa Alam'],
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Old Market, Dahab Mall',
            addressLocality: 'Sharm El Sheikh',
            addressRegion: 'South Sinai',
            addressCountry: 'EG',
          },
          sameAs: [site.instagram, site.telegram],
        }}
      />
      <JsonLd data={faqJsonLd(generalFaq)} />
      <HomeHeader />

      <main id="main-content" tabIndex={-1}>
        <section className={styles.hero}>
          <div className={styles.heroBg}>
            <Image src={imageSrc('/images/hero1.webp', 1920, 1080)} alt="" fill priority sizes="100vw" />
          </div>
          <div className={`wrap ${styles.heroIn}`}>
            <div className={styles.heroTag}>
              <span className={styles.dot} /> Local Egyptian Travel Experts Since 2009 · Trusted by 150,000+ Travellers
            </div>
            <h1>
              Egypt&apos;s Red Sea &amp; ancient wonders, by the people who <em>live here</em>.
            </h1>
            <p className={styles.sub}>
              Since 2009 we&apos;ve shown travellers the real Egypt — diving, deserts, the Nile and the pyramids — across
              four unforgettable destinations. No prepayment, hotel transfer included, and a real person on WhatsApp
              24/7.
            </p>
            <div className={styles.heroActions}>
              <a href="#destinations" className={styles.btnGhost}>
                Explore destinations <ArrowDown />
              </a>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-wa">
                <WhatsAppIcon /> Plan my trip
              </a>
            </div>
            <div className={styles.heroTrust}>
              <div className={styles.ht}>
                <b>
                  {site.stats.rating}
                  <span className={styles.stars}> ★</span>
                </b>
                <span>{site.stats.reviews}+ reviews</span>
              </div>
              <div className={styles.ht}>
                <b>{site.stats.travellers}</b>
                <span>Happy travellers</span>
              </div>
              <div className={styles.ht}>
                <b>{site.stats.years} years</b>
                <span>Local expertise</span>
              </div>
              <div className={styles.ht}>
                <b>4</b>
                <span>Destinations</span>
              </div>
              <div className={styles.scrollCue} aria-hidden>
                Scroll
              </div>
            </div>
          </div>
        </section>

        <section id="destinations" className={`${styles.sec} ${styles.destSec}`} aria-labelledby="dest-title">
          <div className="wrap">
            <div className={`${styles.secHead} reveal`}>
              <div className="eyebrow">Choose your Egypt</div>
              <h2 id="dest-title">Four destinations, one trusted local team</h2>
              <p>From the coral reefs of the Red Sea to the pyramids of Giza — pick where your adventure begins.</p>
            </div>
            <div className={styles.destGrid}>
              {destinations.map((d) => {
                const body = (
                  <>
                    <Image
                      src={imageSrc(d.image, 1000, 750)}
                      alt={d.name}
                      fill
                      sizes="(max-width: 880px) 100vw, 50vw"
                      className={styles.destImg}
                    />
                    <div className={styles.destNum}>{d.num}</div>
                    <div className={`${styles.destBadge} ${d.live ? styles.badgeLive : styles.badgeSoon}`}>
                      {d.live ? `${liveCount}+ tours · Live` : 'Coming soon'}
                    </div>
                    <div className={styles.destBody}>
                      <h3>{d.name}</h3>
                      <p className={styles.dSub}>{d.text}</p>
                      <div className={styles.dFoot}>
                        <span className={styles.dMeta}>{d.meta}</span>
                        {d.live ? (
                          <span className={styles.dGo}>
                            Explore <ArrowRight />
                          </span>
                        ) : (
                          <span className={`${styles.dGo} ${styles.soon}`}>Coming soon</span>
                        )}
                      </div>
                    </div>
                  </>
                );
                return 'href' in d ? (
                  <Link key={d.name} href={d.href} className={`${styles.dest} ${styles.isLive} reveal`}>
                    {body}
                  </Link>
                ) : (
                  <div key={d.name} className={`${styles.dest} reveal`} aria-label={`${d.name} — coming soon`}>
                    {body}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className={styles.reviewsSec} aria-labelledby="reviews-title">
          <div className="wrap">
            <div className={`${styles.secHead} ${styles.center} reveal`}>
              <div className="eyebrow">Reviews</div>
              <h2 id="reviews-title">What our guests say</h2>
            </div>
            <ReviewsCarousel reviews={reviews} tone="dark" />
          </div>
        </section>

        <section id="why" className={styles.sec} aria-labelledby="why-title">
          <div className="wrap">
            <div className={`${styles.secHead} reveal`}>
              <div className="eyebrow">Why Sardor Tours</div>
              <h2 id="why-title">Not a booking app — a local family team</h2>
              <p>
                We run our own offices in Old Market, Dahab Mall Sharm El Sheikh and Cairo. No middlemen, no hotel
                commissions — just honest prices and real people.
              </p>
            </div>
            <div className={styles.whyGrid}>
              {WHY.map((w) => (
                <div key={w.title} className={`${styles.whyCard} reveal`}>
                  <div className={styles.whyIc}>
                    <svg viewBox="0 0 24 24" aria-hidden>
                      {w.icon}
                    </svg>
                  </div>
                  <h3>{w.title}</h3>
                  <p>{w.text}</p>
                </div>
              ))}
            </div>
            <div className={`${styles.langs} reveal`}>
              <span className={styles.langsLbl}>We speak your language:</span>
              <span className={styles.langChip}>🇬🇧 English</span>
              <span className={styles.langChip}>🇷🇺 Русский</span>
              <span className={styles.langChip}>🇮🇹 Italiano</span>
              <span className={styles.langChip}>🇹🇷 Türkçe</span>
            </div>
          </div>
        </section>

        <section id="faq" className={styles.sec} aria-labelledby="faq-title">
          <div className="wrap">
            <div className={`${styles.secHead} reveal`}>
              <div className="eyebrow">FAQ</div>
              <h2 id="faq-title">Frequently asked questions</h2>
            </div>
            <div className={`${styles.faq} reveal`}>
              {generalFaq.map((f) => (
                <details key={f.q} className={styles.hfItem}>
                  <summary>
                    {f.q}
                    <span className={styles.hfIc} aria-hidden />
                  </summary>
                  <div className={styles.hfA}>{f.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <CtaBand />
      </main>

      <Footer variant="home" />

      <a href={wa} target="_blank" rel="noopener noreferrer" className={styles.floatChat} aria-label="Chat with us on WhatsApp">
        <WhatsAppIcon size={28} />
      </a>
    </div>
  );
}
