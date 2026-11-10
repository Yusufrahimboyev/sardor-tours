import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { BottomNav } from '@/components/BottomNav';
import { Footer } from '@/components/Footer';
import { InstagramIcon, TelegramIcon, WhatsAppIcon } from '@/components/icons';
import { SiteHeader } from '@/components/SiteHeader';
import { site, whatsappLink } from '@/data/site';
import { categoryList } from '@/data/categories';
import { tourHref } from '@/data/categories';
import { allTours, toSummary } from '@/data/tours';
import { imageSrc } from '@/lib/images';
import { formatPrice } from '@/i18n/format';
import { pageAlternates, pageOpenGraph } from '@/i18n/metadata';
import { getT } from '@/i18n/messages';
import { langFrom } from '@/i18n/params';
import styles from './video.module.css';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = await langFrom(params);
  const t = getT(lang);
  return {
    title: t('meta.video.title'),
    description: t('meta.video.description'),
    alternates: pageAlternates(lang, '/sharm/video/'),
    openGraph: pageOpenGraph(lang, '/sharm/video/', { title: t('meta.video.title'), description: t('meta.video.description') }),
  };
}

/**
 * The reference page embeds the operator's own excursion videos, which are not
 * available to this project. Until real video files are provided this page is an
 * honest "coming soon" state that still routes visitors to every tour.
 */
export default async function VideoPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await langFrom(params);
  const t = getT(lang);
  const tours = allTours(lang);
  return (
    <div className={styles.page}>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className={styles.main}>
        <h1>{t('video.h1')}</h1>
        <div className={styles.notice} role="status">
          <b>{t('video.noticeBold')}</b>{t('video.noticeText')}
          {site.instagram && (
            <a href={site.instagram} target="_blank" rel="noopener noreferrer">
              <InstagramIcon size={15} /> {t('video.instagram')}
            </a>
          )}
        </div>
        {categoryList(t).map((c) => (
          <section key={c.key} className={styles.cat} aria-labelledby={`v-${c.key}`}>
            <h2 id={`v-${c.key}`}>{c.label}</h2>
            <div className={styles.grid}>
              {tours
                .filter((x) => x.category === c.key)
                .map((x) => (
                  <Link key={x.slug} href={tourHref(lang, x.slug)} className={styles.card}>
                    <Image src={imageSrc(x.cardImage, 500, 880)} alt="" fill sizes="(max-width: 600px) 50vw, 220px" />
                    <span className={styles.grad} />
                    <span className={styles.name}>{x.name}</span>
                    <span className={styles.price}>{t('video.from', { price: formatPrice(x.priceFrom, lang) })}</span>
                  </Link>
                ))}
            </div>
          </section>
        ))}
        <section className={styles.cta} aria-labelledby="v-cta">
          <div className={styles.ctaKicker}>{t('video.cta.kicker')}</div>
          <h2 id="v-cta">{t('video.cta.title')}</h2>
          <p>{t('video.cta.text')}</p>
          <div className={styles.ctaBtns}>
            <a href={whatsappLink(t('client.whatsapp.bookTour'))} target="_blank" rel="noopener noreferrer" className="btn-wa">
              <WhatsAppIcon /> {t('client.nav.messageWhatsapp')}
            </a>
            {site.telegram && (
              <a href={site.telegram} target="_blank" rel="noopener noreferrer" className={styles.tg}>
                <TelegramIcon /> {t('video.cta.telegram')}
              </a>
            )}
          </div>
        </section>
      </main>
      <Footer lang={lang} />
      <BottomNav tours={tours.map(toSummary)} />
    </div>
  );
}
