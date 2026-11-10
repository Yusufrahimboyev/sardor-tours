import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { CtaBand } from '@/components/CtaBand';
import { Footer } from '@/components/Footer';
import { ArrowDown, ArrowRight, WhatsAppIcon } from '@/components/icons';
import { JsonLd, faqJsonLd } from '@/components/JsonLd';
import { destinations, site, whatsappLink } from '@/data/site';
import { MIN_PRICE, tourSlugs } from '@/data/tours';
import { pageAlternates, pageOpenGraph } from '@/i18n/metadata';
import { getGeneralFaq, getT } from '@/i18n/messages';
import { langFrom } from '@/i18n/params';
import { localeHref } from '@/i18n/routing';
import { formatPrice } from '@/i18n/format';
import { imageSrc } from '@/lib/images';
import { HomeHeader } from './HomeHeader';
import styles from './home.module.css';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = await langFrom(params);
  const t = getT(lang);
  const p = { name: site.name };
  return {
    title: { absolute: t('meta.default.title', p) },
    description: t('meta.home.description', p),
    alternates: pageAlternates(lang, '/'),
    openGraph: pageOpenGraph(lang, '/', {
      title: t('meta.home.ogTitle', p),
      description: t('meta.home.ogDescription'),
      images: [{ url: imageSrc('/images/hero1.webp', 1200, 630), width: 1200, height: 630 }],
    }),
  };
}

const WHY = [
  {
    key: 'noPrepay',
    icon: <path d="M20 6 9 17l-5-5" />,
  },
  {
    key: 'transfer',
    icon: (
      <>
        <path d="M5 11l2-7h10l2 7M5 11h14M5 11v6h14v-6M7 17v2M17 17v2" />
        <circle cx="8" cy="14" r="1.4" />
        <circle cx="16" cy="14" r="1.4" />
      </>
    ),
  },
  {
    key: 'cancel',
    icon: (
      <>
        <path d="M12 2 4 5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
  },
  {
    key: 'support',
    icon: <path d="M21 11.5a8.38 8.38 0 0 1-9 8.4 8.5 8.5 0 0 1-3.8-.9L3 20l1.3-3.8A8.38 8.38 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z" />,
  },
];

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await langFrom(params);
  const t = getT(lang);
  const faq = getGeneralFaq(lang);
  const wa = whatsappLink(t('client.whatsapp.planTrip'));
  const liveCount = tourSlugs.length;

  return (
    <div className={styles.page}>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'TravelAgency',
          name: site.name,
          url: site.url,
          description: t('meta.default.description'),
          ...(site.whatsappNumber && { telephone: `+${site.whatsappNumber}` }),
          ...(site.email && { email: site.email }),
          priceRange: '£',
          areaServed: ['Sharm El Sheikh'],
          sameAs: [site.instagram, site.telegram].filter(Boolean),
        }}
      />
      <JsonLd data={faqJsonLd(faq, lang)} />
      <HomeHeader />

      <main id="main-content" tabIndex={-1}>
        <section className={styles.hero}>
          <div className={styles.heroBg}>
            <Image src={imageSrc('/images/hero1.webp', 1920, 1080)} alt="" fill priority sizes="100vw" />
          </div>
          <div className={`wrap ${styles.heroIn}`}>
            <div className={styles.heroTag}>
              <span className={styles.dot} /> {t('home.heroTag')}
            </div>
            <h1>
              {t('home.h1.before')}
              <em>{t('home.h1.em')}</em>
              {t('home.h1.after')}
            </h1>
            <p className={styles.sub}>
              {t('home.sub')}
            </p>
            <div className={styles.heroActions}>
              <a href="#destinations" className={styles.btnGhost}>
                {t('home.explore')} <ArrowDown />
              </a>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-wa">
                <WhatsAppIcon /> {t('home.plan')}
              </a>
            </div>
            <div className={styles.heroTrust}>
              <div className={styles.ht}>
                <b>{liveCount}+</b>
                <span>{t('home.trust.excursions')}</span>
              </div>
              <div className={styles.ht}>
                <b>{formatPrice(MIN_PRICE, lang)}</b>
                <span>{t('home.trust.pricesFrom')}</span>
              </div>
              <div className={styles.ht}>
                <b>{formatPrice(0, lang)}</b>
                <span>{t('home.trust.prepayment')}</span>
              </div>
              <div className={styles.ht}>
                <b>4</b>
                <span>{t('home.trust.destinations')}</span>
              </div>
              <div className={styles.scrollCue} aria-hidden>
                {t('home.trust.scroll')}
              </div>
            </div>
          </div>
        </section>

        <section id="destinations" className={`${styles.sec} ${styles.destSec}`} aria-labelledby="dest-title">
          <div className="wrap">
            <div className={`${styles.secHead} reveal`}>
              <div className="eyebrow">{t('home.destSection.eyebrow')}</div>
              <h2 id="dest-title">{t('home.destSection.title')}</h2>
              <p>{t('home.destSection.text')}</p>
            </div>
            <div className={styles.destGrid}>
              {destinations.map((d) => {
                const name = t(`home.destinations.${d.num}.name`);
                const body = (
                  <>
                    <Image
                      src={imageSrc(d.image, 1000, 750)}
                      alt={name}
                      fill
                      sizes="(max-width: 880px) 100vw, 50vw"
                      className={styles.destImg}
                    />
                    <div className={styles.destNum}>{d.num}</div>
                    <div className={`${styles.destBadge} ${d.live ? styles.badgeLive : styles.badgeSoon}`}>
                      {d.live ? t('home.destSection.live', { n: liveCount }) : t('home.destSection.soon')}
                    </div>
                    <div className={styles.destBody}>
                      <h3>{name}</h3>
                      <p className={styles.dSub}>{t(`home.destinations.${d.num}.text`)}</p>
                      <div className={styles.dFoot}>
                        <span className={styles.dMeta}>{t(`home.destinations.${d.num}.meta`)}</span>
                        {d.live ? (
                          <span className={styles.dGo}>
                            {t('home.destSection.explore')} <ArrowRight />
                          </span>
                        ) : (
                          <span className={`${styles.dGo} ${styles.soon}`}>{t('home.destSection.soon')}</span>
                        )}
                      </div>
                    </div>
                  </>
                );
                return 'path' in d ? (
                  <Link key={d.num} href={localeHref(lang, d.path)} className={`${styles.dest} ${styles.isLive} reveal`}>
                    {body}
                  </Link>
                ) : (
                  <div key={d.num} className={`${styles.dest} reveal`} aria-label={t('home.destSection.soonAria', { name })}>
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
              <div className="eyebrow">{t('home.why.eyebrow', { name: site.name })}</div>
              <h2 id="why-title">{t('home.why.title')}</h2>
              <p>{t('home.why.text')}</p>
            </div>
            <div className={styles.whyGrid}>
              {WHY.map((w) => (
                <div key={w.key} className={`${styles.whyCard} reveal`}>
                  <div className={styles.whyIc}>
                    <svg viewBox="0 0 24 24" aria-hidden>
                      {w.icon}
                    </svg>
                  </div>
                  <h3>{t(`home.why.${w.key}.title`)}</h3>
                  <p>{t(`home.why.${w.key}.text`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className={styles.sec} aria-labelledby="faq-title">
          <div className="wrap">
            <div className={`${styles.secHead} reveal`}>
              <div className="eyebrow">{t('home.faq.eyebrow')}</div>
              <h2 id="faq-title">{t('home.faq.title')}</h2>
            </div>
            <div className={`${styles.faq} reveal`}>
              {faq.map((f) => (
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

        <CtaBand lang={lang} />
      </main>

      <Footer lang={lang} variant="home" />

      <a href={wa} target="_blank" rel="noopener noreferrer" className={styles.floatChat} aria-label={t('client.support.chatAria')}>
        <WhatsAppIcon size={28} />
      </a>
    </div>
  );
}
