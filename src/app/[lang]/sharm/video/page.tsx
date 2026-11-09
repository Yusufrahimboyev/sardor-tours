import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { BottomNav } from '@/components/BottomNav';
import { Footer } from '@/components/Footer';
import { InstagramIcon, TelegramIcon, WhatsAppIcon } from '@/components/icons';
import { SiteHeader } from '@/components/SiteHeader';
import { BOOK_TOUR_MSG, site, whatsappLink } from '@/data/site';
import { CATEGORIES_EN as CATEGORIES } from '@/data/categories';
import { tourHref } from '@/data/categories';
import { allTours, toSummary } from '@/data/tours';
import { imageSrc } from '@/lib/images';
import { langFrom } from '@/i18n/params';
import { localeHref } from '@/i18n/routing';
import styles from './video.module.css';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = await langFrom(params);
  return {
    title: 'Sharm El Sheikh Tour Videos',
    description: 'Excursion videos from Sharm El Sheikh — sea trips, desert safaris and historical tours.',
    alternates: { canonical: localeHref(lang, '/sharm/video/') },
  };
}

/**
 * The reference page embeds the operator's own excursion videos, which are not
 * available to this project. Until real video files are provided this page is an
 * honest "coming soon" state that still routes visitors to every tour.
 */
export default async function VideoPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await langFrom(params);
  const tours = allTours(lang);
  return (
    <div className={styles.page}>
      <SiteHeader lang={lang} />
      <main id="main-content" tabIndex={-1} className={styles.main}>
        <h1>Sharm El Sheikh Excursion Videos</h1>
        <div className={styles.notice} role="status">
          <b>🎬 Videos are coming soon.</b> In the meantime, browse the photo galleries on each tour page.
          {site.instagram && (
            <a href={site.instagram} target="_blank" rel="noopener noreferrer">
              <InstagramIcon size={15} /> Watch on Instagram
            </a>
          )}
        </div>
        {CATEGORIES.map((c) => (
          <section key={c.key} className={styles.cat} aria-labelledby={`v-${c.key}`}>
            <h2 id={`v-${c.key}`}>{c.label}</h2>
            <div className={styles.grid}>
              {tours
                .filter((t) => t.category === c.key)
                .map((t) => (
                  <Link key={t.slug} href={tourHref(lang, t.slug)} className={styles.card}>
                    <Image src={imageSrc(t.cardImage, 500, 880)} alt="" fill sizes="(max-width: 600px) 50vw, 220px" />
                    <span className={styles.grad} />
                    <span className={styles.name}>{t.name}</span>
                    <span className={styles.price}>from £{t.priceFrom}</span>
                  </Link>
                ))}
            </div>
          </section>
        ))}
        <section className={styles.cta} aria-labelledby="v-cta">
          <div className={styles.ctaKicker}>Ready for an adventure?</div>
          <h2 id="v-cta">Message us — we reply in minutes</h2>
          <p>We&apos;ll find the best tour for your budget. No prepayment, transfer included.</p>
          <div className={styles.ctaBtns}>
            <a href={whatsappLink(BOOK_TOUR_MSG)} target="_blank" rel="noopener noreferrer" className="btn-wa">
              <WhatsAppIcon /> Message us on WhatsApp
            </a>
            {site.telegram && (
              <a href={site.telegram} target="_blank" rel="noopener noreferrer" className={styles.tg}>
                <TelegramIcon /> Telegram
              </a>
            )}
          </div>
        </section>
      </main>
      <Footer lang={lang} />
      <BottomNav lang={lang} tours={tours.map(toSummary)} />
    </div>
  );
}
