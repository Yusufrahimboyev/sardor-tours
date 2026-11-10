import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { FaqList } from '@/components/FaqList';
import { Footer } from '@/components/Footer';
import { CheckIcon, ClockIcon, InfoIcon, InstagramIcon, PinIcon, TelegramIcon, WhatsAppIcon } from '@/components/icons';
import { JsonLd, faqJsonLd } from '@/components/JsonLd';
import { SiteHeader } from '@/components/SiteHeader';
import { site, whatsappLink } from '@/data/site';
import { CATEGORY_KEYS } from '@/data/categories';
import { MIN_PRICE, tourSlugs } from '@/data/tours';
import { imageSrc } from '@/lib/images';
import { formatPrice } from '@/i18n/format';
import { pageAlternates, pageOpenGraph } from '@/i18n/metadata';
import { getGeneralFaq, getList, getT } from '@/i18n/messages';
import { langFrom } from '@/i18n/params';
import { localeHref } from '@/i18n/routing';
import styles from './about.module.css';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = await langFrom(params);
  const t = getT(lang);
  const p = { name: site.name };
  return {
    title: t('meta.about.title'),
    description: t('meta.about.description', p),
    alternates: pageAlternates(lang, '/about-us/'),
    openGraph: pageOpenGraph(lang, '/about-us/', {
      title: t('meta.about.ogTitle', p),
      description: t('meta.about.description', p),
      images: [imageSrc('/images/about-hero.webp', 1200, 630)],
    }),
  };
}

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await langFrom(params);
  const t = getT(lang);
  const faq = getGeneralFaq(lang);
  const reasons = getList<{ title: string; text: string }[]>(lang, 'about.reasons');
  const price = formatPrice(MIN_PRICE, lang);
  return (
    <div className={styles.page}>
      <JsonLd data={faqJsonLd(faq, lang)} />
      <SiteHeader overlay />

      <main id="main-content" tabIndex={-1}>
        <section className={styles.hero}>
          <Image src={imageSrc('/images/about-hero.webp', 1920, 1080)} alt="" fill priority sizes="100vw" className={styles.heroImg} />
          <div className={styles.heroScrim} />
          <div className={styles.heroIn}>
            <div>
              <div className={styles.tag}>
                <i aria-hidden /> {t('about.tag')}
              </div>
              <h1>
                {t('about.h1.before')}<span>{t('about.h1.em')}</span>{t('about.h1.after')}
              </h1>
              <p>
                {t('about.p1', { name: site.name })}
              </p>
              <p>{t('about.p2')}</p>
              <div className={styles.actions}>
                <Link href={localeHref(lang, '/sharm/')} className={styles.btnWhite}>
                  <InfoIcon size={16} /> {t('about.allExcursions')}
                </Link>
                <a href={whatsappLink(t('client.whatsapp.bookTour'))} target="_blank" rel="noopener noreferrer" className={styles.btnGlass}>
                  <WhatsAppIcon size={16} /> {t('client.nav.messageWhatsapp')}
                </a>
                {site.instagram && (
                  <a href={site.instagram} target="_blank" rel="noopener noreferrer" className={styles.btnIg}>
                    <InstagramIcon size={16} /> {t('about.instagram')}
                  </a>
                )}
              </div>
            </div>
            <div className={styles.cards}>
              {[
                ['destination', <PinIcon key="p" />],
                ['excursions', <InfoIcon key="i" size={18} />],
                ['prices', <ClockIcon key="c" size={18} />],
                ['prepayment', <CheckIcon key="l" size={18} />],
              ].map(([k, ic]) => (
                <div key={k as string} className={styles.hc}>
                  <span className={styles.hcIc}>{ic}</span>
                  <span>
                    <small>{t(`about.cards.${k as string}.label`)}</small>
                    <b>{t(`about.cards.${k as string}.value`, { n: tourSlugs.length, price })}</b>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className={styles.statsWrap}>
          <div className={styles.stats}>
            {[
              ['excursions', `${tourSlugs.length}+`],
              ['categories', String(CATEGORY_KEYS.length)],
              ['pricesFrom', price],
              ['prepayment', formatPrice(0, lang)],
            ].map(([k, n]) => (
              <div key={k}>
                <b>{n}</b>
                <span>{t(`about.stats.${k}`)}</span>
              </div>
            ))}
          </div>
        </div>

        <section className={styles.sec} aria-labelledby="why-h">
          <div className={styles.head}>
            <span className={styles.secTag}>{t('about.why.tag')}</span>
            <h2 id="why-h">
              {t('about.why.before')}<span>{t('about.why.em')}</span>
            </h2>
          </div>
          <div className={styles.reasons}>
            {reasons.map((r, i) => (
              <div key={r.title} className={`${styles.reason} reveal`}>
                <span className={styles.reasonN}>{String(i + 1).padStart(2, '0')}</span>
                <h3>{r.title}</h3>
                <p>{r.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={`${styles.sec} ${styles.alt}`} aria-labelledby="faq-h">
          <div className={styles.head}>
            <span className={styles.secTag}>{t('about.faq.tag')}</span>
            <h2 id="faq-h">
              {t('about.faq.before')}<span>{t('about.faq.em')}</span>
            </h2>
          </div>
          <div className={styles.narrow}>
            <FaqList items={faq} />
          </div>
        </section>

        <section className={styles.cta} aria-labelledby="cta-h">
          <h2 id="cta-h">{t('about.cta.title')}</h2>
          <p>{t('about.cta.text')}</p>
          <div className={styles.ctaBtns}>
            <Link href={localeHref(lang, '/sharm/')} className={styles.btnWhite}>
              {t('about.allExcursions')}
            </Link>
            <a href={whatsappLink(t('client.whatsapp.bookTour'))} target="_blank" rel="noopener noreferrer" className={styles.btnGlass}>
              <WhatsAppIcon size={16} /> {t('client.nav.whatsapp')}
            </a>
            {site.telegram && (
              <a href={site.telegram} target="_blank" rel="noopener noreferrer" className={styles.btnGlass}>
                <TelegramIcon size={16} /> {t('about.cta.telegram')}
              </a>
            )}
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </div>
  );
}
