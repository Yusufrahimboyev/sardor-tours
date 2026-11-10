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
import { SupportWidget } from '@/components/SupportWidget';
import { site, whatsappLink } from '@/data/site';
import { categoryList, categoryShort, tourHref } from '@/data/categories';
import { allTours, BESTSELLERS, getTour, MIN_PRICE, toSummary, tourSlugs } from '@/data/tours';
import { imageSrc } from '@/lib/images';
import { formatPrice } from '@/i18n/format';
import { pageAlternates, pageOpenGraph } from '@/i18n/metadata';
import { getGeneralFaq, getList, getT } from '@/i18n/messages';
import { langFrom } from '@/i18n/params';
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher';
import { localeHref } from '@/i18n/routing';
import { Bestsellers } from './Bestsellers';
import { HeroSearch } from './HeroSearch';
import { ToursCatalog } from './ToursCatalog';
import { WorldMap } from './WorldMap';
import styles from './sharm.module.css';

const count = tourSlugs.length;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = await langFrom(params);
  const t = getT(lang);
  return {
    title: t('meta.sharm.title', { count }),
    description: t('meta.sharm.description', { price: formatPrice(MIN_PRICE, lang) }),
    alternates: pageAlternates(lang, '/sharm/'),
    openGraph: pageOpenGraph(lang, '/sharm/', {
      title: t('meta.sharm.ogTitle'),
      description: t('meta.sharm.ogDescription'),
      images: [{ url: imageSrc('/images/hero1.webp', 1200, 630), width: 1200, height: 630 }],
    }),
  };
}

const BENEFITS = [
  { key: 'prices', icon: '💰' },
  { key: 'noPrepay', icon: '🤝' },
  { key: 'instant', icon: '⚡' },
  { key: 'transfer', icon: '🚌' },
  { key: 'guides', icon: '🗣️' },
  { key: 'insurance', icon: '🛡️' },
] as const;

const STEP_KEYS = ['choose', 'request', 'pickup'] as const;

export default async function SharmPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await langFrom(params);
  const t = getT(lang);
  const faq = getGeneralFaq(lang);
  const price = formatPrice(MIN_PRICE, lang);
  const promise = getList<{ title: string; text: string }[]>(lang, 'sharm.promise.items');
  const tours = allTours(lang);
  const summaries = tours.map(toSummary);
  const bestsellers = BESTSELLERS.map((b) => ({
    href: tourHref(lang, b.slug),
    name: getTour(b.slug, lang)!.name,
    tag: categoryShort(t, b.category),
    image: b.image,
  }));

  return (
    <div className={styles.page}>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: t('sharm.jsonLdName'),
          inLanguage: lang,
          itemListElement: tours.map((tr, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
              '@type': 'TouristTrip',
              name: tr.name,
              url: `${site.url}${tourHref(lang, tr.slug)}`,
              touristType: tr.categoryLabel,
              offers: { '@type': 'Offer', price: String(tr.priceFrom), priceCurrency: 'GBP', availability: 'https://schema.org/InStock' },
            },
          })),
        }}
      />
      <JsonLd data={faqJsonLd(faq, lang)} />

      <section className={styles.hero}>
        <div className={styles.heroMedia}>
          <Image src={imageSrc('/images/hero1.webp', 1920, 1080)} alt="" fill priority sizes="100vw" />
        </div>
        <div className={styles.heroScrim} />
        <nav className={styles.heroNav} aria-label={t('client.nav.main')}>
          <Brand />
          <div className={styles.heroNavLinks}>
            <LanguageSwitcher />
            <Link href={localeHref(lang, '/')}>{t('client.nav.destinations')}</Link>
            <Link href={localeHref(lang, '/about-us/')}>{t('client.nav.about')}</Link>
            <a href={whatsappLink(t('client.whatsapp.bookTour'))} target="_blank" rel="noopener noreferrer" className={styles.heroNavWa}>
              <WhatsAppIcon size={16} />
              <span>{t('client.nav.whatsapp')}</span>
            </a>
          </div>
        </nav>
        <div className={styles.heroBody} id="main-content" tabIndex={-1}>
          <h1 className={styles.heroH1}>
            <span>{t('sharm.hero.title')}</span>
            <span className={styles.heroAccent}>{t('sharm.hero.accent')}</span>
          </h1>
          <p className={styles.heroLede}>
            <span className={styles.liveDot} aria-hidden />
            {t('sharm.hero.lede')}
          </p>
          <HeroSearch lang={lang} tours={summaries} />
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <div>
                <div className={styles.heroStatNum}>{t('sharm.hero.excursions', { n: count })}</div>
                <div className={styles.heroStatLbl}>{t('sharm.hero.excursionsSub')}</div>
              </div>
            </div>
            <div className={styles.heroStat}>
              <div>
                <div className={styles.heroStatNum}>{t('sharm.hero.from', { price })}</div>
                <div className={styles.heroStatLbl}>{t('sharm.hero.fromSub')}</div>
              </div>
            </div>
            <div className={styles.heroStat}>
              <div>
                <div className={styles.heroStatNum}>{t('sharm.hero.upfront')}</div>
                <div className={styles.heroStatLbl}>{t('sharm.hero.upfrontSub')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.layout}>
        <main className={styles.left}>
          <section className={styles.benefits} aria-label={t('sharm.benefitsAria')}>
            {BENEFITS.map((b) => (
              <div key={b.key} className={styles.benefit}>
                <div className={styles.benefitIcon} aria-hidden>
                  {b.icon}
                </div>
                <h2 className={styles.benefitTitle}>{t(`sharm.benefits.${b.key}.title`)}</h2>
                <p className={styles.benefitDesc}>{t(`sharm.benefits.${b.key}.text`, { price })}</p>
              </div>
            ))}
          </section>

          <section className={styles.bsSec} aria-labelledby="bs-h">
            <div className={styles.bsHead}>
              <div>
                <div className={styles.secEyebrow}>{t('sharm.bestsellers.eyebrow')}</div>
                <h2 id="bs-h" className={styles.bsTitle}>
                  {t('sharm.bestsellers.title')}
                </h2>
              </div>
              <a href="#tours" className={styles.allLink}>
                {t('sharm.bestsellers.all')}
              </a>
            </div>
            <Bestsellers items={bestsellers} />
          </section>

          <section className={styles.toursSec} id="tours" aria-labelledby="tours-h">
            <div className={styles.secEyebrow}>{t('sharm.tours.eyebrow')}</div>
            <h2 id="tours-h" className={styles.secTitle}>
              {t('sharm.tours.titleLine1')}
              <br />
              <span>{t('sharm.tours.titleLine2')}</span>
            </h2>
            <ToursCatalog categories={categoryList(t)} tours={summaries} />
          </section>

          <section className={styles.bmSec} id="faq" aria-labelledby="faq-h">
            <span className={styles.bmEyebrow}>{t('sharm.faq.eyebrow')}</span>
            <h2 id="faq-h" className={styles.faqH}>
              {t('sharm.faq.before')}<span>{t('sharm.faq.em')}</span>
            </h2>
            <FaqList items={faq} />
          </section>

          <section className={`${styles.bmSec} ${styles.bmAlt}`} aria-labelledby="promise-h">
            <div className={styles.bmHeadRow}>
              <div>
                <span className={styles.bmEyebrow}>{t('sharm.promise.eyebrow')}</span>
                <h2 id="promise-h" className={styles.bmH}>
                  {t('sharm.promise.line1')}
                  <br />
                  <span>{t('sharm.promise.line2')}</span>
                </h2>
              </div>
              <div className={`${styles.ghostText} ${styles.ghostFaint}`} aria-hidden>
                {t('sharm.promise.ghost')}
              </div>
            </div>
            <ol className={styles.whyList}>
              {promise.map((p, i) => (
                <li key={p.title} className={`${styles.whyRow} reveal`} style={{ transitionDelay: `${i * 60}ms` }}>
                  <span className={styles.whyN}>{String(i + 1).padStart(2, '0')}</span>
                  <span>
                    <b>{p.title}</b>
                    <small>{p.text}</small>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section className={styles.bmSec} aria-labelledby="steps-h">
            <span className={styles.bmEyebrow}>{t('sharm.steps.eyebrow')}</span>
            <div className={styles.bmHeadRow}>
              <h2 id="steps-h" className={styles.bmH}>
                {t('sharm.steps.line1')}
                <br />
                <span>{t('sharm.steps.line2')}</span>
              </h2>
              <div className={`${styles.ghostText} ${styles.ghostSm}`} aria-hidden>
                {t('sharm.steps.ghost')}
              </div>
            </div>
            <ol className={styles.steps}>
              {STEP_KEYS.map((k, i) => (
                <li key={k} className={`${styles.step} reveal`}>
                  <span className={styles.stepN}>{i + 1}</span>
                  <span>
                    <b>{t(`sharm.steps.${k}.title`)}</b>
                    <small>{t(`sharm.steps.${k}.text`, { n: count, price })}</small>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section className={styles.statsBanner} aria-label={t('sharm.stats.aria')}>
            <div className={styles.stat}>
              <div className={styles.statN}>
                <CountUp value={count} suffix="+" />
              </div>
              <div className={styles.statL}>{t('sharm.stats.tours')}</div>
            </div>
            <i />
            <div className={styles.stat}>
              <div className={styles.statN}>
                <CountUp value={4} />
              </div>
              <div className={styles.statL}>{t('sharm.stats.categories')}</div>
            </div>
            <i />
            <div className={styles.stat}>
              <div className={styles.statN}>
                £<CountUp value={MIN_PRICE} />
              </div>
              <div className={styles.statL}>{t('sharm.stats.from')}</div>
            </div>
          </section>

          <section className={styles.mapSec} aria-labelledby="map-h">
            <span className={styles.bmEyebrow}>{t('sharm.map.eyebrow')}</span>
            <h2 id="map-h" className={`${styles.bmH} ${styles.onDark}`}>
              {t('sharm.map.line1')}
              <br />
              {t('sharm.map.line2before')}<span>{t('sharm.map.line2em')}</span>
            </h2>
            <WorldMap lang={lang} />
          </section>
        </main>

        <aside className={styles.right} aria-label={t('sharm.book.aria')}>
          <div className={styles.bookPanel}>
            <div className={styles.bookPanelTitle}>{t('sharm.book.title')}</div>
            <div className={styles.bookPanelSub}>{t('sharm.book.sub')}</div>
            <div className={styles.bookPanelPrice}>
              {t('sharm.book.from')} <span>{price}</span> {t('sharm.book.perPerson')}
            </div>
            <ul className={styles.bookPanelBenefits}>
              {getList<string[]>(lang, 'sharm.book.benefits').map(
                (b) => (
                  <li key={b}>
                    <span aria-hidden>✓</span> {b}
                  </li>
                ),
              )}
            </ul>
            <a href="#tours" className={styles.bookPanelCta}>
              {t('sharm.book.cta')}
            </a>
            <a href={whatsappLink(t('client.whatsapp.bookTour'))} target="_blank" rel="noopener noreferrer" className={styles.bookPanelWa}>
              <WhatsAppIcon /> {t('client.nav.messageWhatsapp')}
            </a>
            <div className={styles.bookPanelNote}>{t('sharm.book.note')}</div>
          </div>
        </aside>
      </div>

      <CtaBand lang={lang} />
      <Footer lang={lang} />
      <BottomNav tours={summaries} revealAfter={500} />
      <SupportWidget />
    </div>
  );
}
