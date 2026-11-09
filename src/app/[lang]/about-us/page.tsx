import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { FaqList } from '@/components/FaqList';
import { Footer } from '@/components/Footer';
import { CheckIcon, ClockIcon, InfoIcon, InstagramIcon, PinIcon, TelegramIcon, WhatsAppIcon } from '@/components/icons';
import { JsonLd, faqJsonLd } from '@/components/JsonLd';
import { SiteHeader } from '@/components/SiteHeader';
import { generalFaq, site, whatsappLink } from '@/data/site';
import { CATEGORY_KEYS } from '@/data/categories';
import { MIN_PRICE, tourSlugs } from '@/data/tours';
import { imageSrc } from '@/lib/images';
import { getT } from '@/i18n/messages';
import { langFrom } from '@/i18n/params';
import { localeHref } from '@/i18n/routing';
import styles from './about.module.css';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = await langFrom(params);
  return {
    title: 'About Us — Excursions in Sharm El Sheikh',
    description: `${site.name} — excursions and day trips from Sharm El Sheikh. No prepayment, hotel transfer included, easy online booking.`,
    alternates: { canonical: localeHref(lang, '/about-us/') },
    openGraph: { url: localeHref(lang, '/about-us/'), title: `About ${site.name}`, images: [imageSrc('/images/about-hero.webp', 1200, 630)] },
  };
}

const REASONS = [
  ['Clear prices', 'The price you see is the price you pay — transfer included, no hidden extras.'],
  ['No prepayment', 'Book online in minutes and pay on the day of your excursion for most tours.'],
  ['Hotel transfer included', "We pick you up from your hotel's main entrance and bring you back after the tour."],
  ['Free cancellation', 'Plans changed? Cancel free of charge up to 24 hours before the start.'],
  ['Easy booking', 'Choose a date and guests online and get a booking reference straight away.'],
  ['Real people', 'Questions before or during your trip? Message us on WhatsApp and a real person answers.'],
];

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await langFrom(params);
  const t = getT(lang);
  return (
    <div className={styles.page}>
      <JsonLd data={faqJsonLd(generalFaq)} />
      <SiteHeader overlay />

      <main id="main-content" tabIndex={-1}>
        <section className={styles.hero}>
          <Image src={imageSrc('/images/about-hero.webp', 1920, 1080)} alt="" fill priority sizes="100vw" className={styles.heroImg} />
          <div className={styles.heroScrim} />
          <div className={styles.heroIn}>
            <div>
              <div className={styles.tag}>
                <i aria-hidden /> Excursions in Sharm El Sheikh
              </div>
              <h1>
                We <span>know every wave</span> and every dune
              </h1>
              <p>
                {site.name} brings together the best day trips from Sharm El Sheikh — Red Sea boat trips, desert safaris and
                journeys to Dahab, Cairo, Luxor and Petra — in one place, with simple online booking.
              </p>
              <p>No prepayment for most tours, hotel transfer included and a real person to help you on WhatsApp.</p>
              <div className={styles.actions}>
                <Link href={localeHref(lang, '/sharm/')} className={styles.btnWhite}>
                  <InfoIcon size={16} /> All excursions
                </Link>
                <a href={whatsappLink(t('client.whatsapp.bookTour'))} target="_blank" rel="noopener noreferrer" className={styles.btnGlass}>
                  <WhatsAppIcon size={16} /> Message us on WhatsApp
                </a>
                {site.instagram && (
                  <a href={site.instagram} target="_blank" rel="noopener noreferrer" className={styles.btnIg}>
                    <InstagramIcon size={16} /> Instagram
                  </a>
                )}
              </div>
            </div>
            <div className={styles.cards}>
              {[
                ['Destination', 'Sharm El Sheikh', <PinIcon key="p" />],
                ['Excursions', `${tourSlugs.length}+ tours`, <InfoIcon key="i" size={18} />],
                ['Prices', `from £${MIN_PRICE}`, <ClockIcon key="c" size={18} />],
                ['Prepayment', '£0 — pay on the day', <CheckIcon key="l" size={18} />],
              ].map(([l, v, ic]) => (
                <div key={l as string} className={styles.hc}>
                  <span className={styles.hcIc}>{ic}</span>
                  <span>
                    <small>{l}</small>
                    <b>{v}</b>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className={styles.statsWrap}>
          <div className={styles.stats}>
            {[
              [`${tourSlugs.length}+`, 'Excursions'],
              [String(CATEGORY_KEYS.length), 'Categories'],
              [`£${MIN_PRICE}`, 'Prices from'],
              ['£0', 'Prepayment'],
            ].map(([n, l]) => (
              <div key={l}>
                <b>{n}</b>
                <span>{l}</span>
              </div>
            ))}
          </div>
        </div>

        <section className={styles.sec} aria-labelledby="why-h">
          <div className={styles.head}>
            <span className={styles.secTag}>Why us</span>
            <h2 id="why-h">
              Six reasons to <span>book with us</span>
            </h2>
          </div>
          <div className={styles.reasons}>
            {REASONS.map(([t, d], i) => (
              <div key={t} className={`${styles.reason} reveal`}>
                <span className={styles.reasonN}>{String(i + 1).padStart(2, '0')}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={`${styles.sec} ${styles.alt}`} aria-labelledby="faq-h">
          <div className={styles.head}>
            <span className={styles.secTag}>FAQ</span>
            <h2 id="faq-h">
              Questions we <span>hear every day</span>
            </h2>
          </div>
          <div className={styles.narrow}>
            <FaqList items={generalFaq} />
          </div>
        </section>

        <section className={styles.cta} aria-labelledby="cta-h">
          <h2 id="cta-h">Ready to discover Sharm El Sheikh?</h2>
          <p>Browse our excursions or message us — we&apos;ll help you find the perfect trip for your group, budget and interests.</p>
          <div className={styles.ctaBtns}>
            <Link href={localeHref(lang, '/sharm/')} className={styles.btnWhite}>
              All excursions
            </Link>
            <a href={whatsappLink(t('client.whatsapp.bookTour'))} target="_blank" rel="noopener noreferrer" className={styles.btnGlass}>
              <WhatsAppIcon size={16} /> WhatsApp
            </a>
            {site.telegram && (
              <a href={site.telegram} target="_blank" rel="noopener noreferrer" className={styles.btnGlass}>
                <TelegramIcon size={16} /> Telegram
              </a>
            )}
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </div>
  );
}
