import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { CtaBand } from '@/components/CtaBand';
import { Footer } from '@/components/Footer';
import { ArrowDown, ArrowRight, WhatsAppIcon } from '@/components/icons';
import { JsonLd, faqJsonLd } from '@/components/JsonLd';
import { destinations, generalFaq, PLAN_TRIP_MSG, site, whatsappLink } from '@/data/site';
import { MIN_PRICE, tourSlugs } from '@/data/tours';
import { langFrom } from '@/i18n/params';
import { localeHref } from '@/i18n/routing';
import { imageSrc } from '@/lib/images';
import { HomeHeader } from './HomeHeader';
import styles from './home.module.css';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = await langFrom(params);
  const url = localeHref(lang, '/');
  return {
    title: { absolute: `${site.name} — Egypt Excursions in Sharm El Sheikh, Hurghada, Cairo & Marsa Alam` },
    description:
      'Sardor Tours — excursions and day trips from Sharm El Sheikh: Red Sea boat trips, desert safaris, Cairo, Luxor and Petra. No prepayment, hotel transfer included.',
    alternates: { canonical: url },
    openGraph: {
      url,
      title: `${site.name} — Egypt Excursions`,
      description: 'Excursions from Sharm El Sheikh. No prepayment · hotel transfer included.',
      images: [{ url: imageSrc('/images/hero1.webp', 1200, 630), width: 1200, height: 630 }],
    },
  };
}

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
    title: 'Free cancellation',
    text: 'Plans changed? Cancel free of charge up to 24 hours before your tour starts.',
    icon: (
      <>
        <path d="M12 2 4 5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
  },
  {
    title: '24/7 support',
    text: 'A real person answers on WhatsApp — before your trip and on the day itself.',
    icon: <path d="M21 11.5a8.38 8.38 0 0 1-9 8.4 8.5 8.5 0 0 1-3.8-.9L3 20l1.3-3.8A8.38 8.38 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z" />,
  },
];

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await langFrom(params);
  const wa = whatsappLink(PLAN_TRIP_MSG);
  const liveCount = tourSlugs.length;

  return (
    <div className={styles.page}>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'TravelAgency',
          name: site.name,
          url: site.url,
          description: site.description,
          ...(site.whatsappNumber && { telephone: `+${site.whatsappNumber}` }),
          ...(site.email && { email: site.email }),
          priceRange: '£',
          areaServed: ['Sharm El Sheikh'],
          sameAs: [site.instagram, site.telegram].filter(Boolean),
        }}
      />
      <JsonLd data={faqJsonLd(generalFaq)} />
      <HomeHeader lang={lang} />

      <main id="main-content" tabIndex={-1}>
        <section className={styles.hero}>
          <div className={styles.heroBg}>
            <Image src={imageSrc('/images/hero1.webp', 1920, 1080)} alt="" fill priority sizes="100vw" />
          </div>
          <div className={`wrap ${styles.heroIn}`}>
            <div className={styles.heroTag}>
              <span className={styles.dot} /> Excursions in Egypt · No prepayment · Hotel transfer included
            </div>
            <h1>
              Egypt&apos;s Red Sea &amp; ancient wonders, by the people who <em>live here</em>.
            </h1>
            <p className={styles.sub}>
              Discover the real Egypt — diving, deserts, the Nile and the pyramids. No prepayment, hotel transfer
              included, and a real person on WhatsApp to help you plan.
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
                <b>{liveCount}+</b>
                <span>Excursions</span>
              </div>
              <div className={styles.ht}>
                <b>£{MIN_PRICE}</b>
                <span>Prices from</span>
              </div>
              <div className={styles.ht}>
                <b>£0</b>
                <span>Prepayment</span>
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
              <h2 id="dest-title">Choose where your adventure begins</h2>
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
                return 'path' in d ? (
                  <Link key={d.name} href={localeHref(lang, d.path)} className={`${styles.dest} ${styles.isLive} reveal`}>
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

        <section id="why" className={styles.sec} aria-labelledby="why-title">
          <div className="wrap">
            <div className={`${styles.secHead} reveal`}>
              <div className="eyebrow">Why Sardor Tours</div>
              <h2 id="why-title">Simple, honest and local</h2>
              <p>
                Clear prices with no hidden fees, an easy online booking and a real person to answer your
                questions.
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

      <Footer lang={lang} variant="home" />

      <a href={wa} target="_blank" rel="noopener noreferrer" className={styles.floatChat} aria-label="Chat with us on WhatsApp">
        <WhatsAppIcon size={28} />
      </a>
    </div>
  );
}
