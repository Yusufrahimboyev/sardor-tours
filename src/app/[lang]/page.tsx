import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ContactForm } from '@/components/site/ContactForm';
import { ReviewList } from '@/components/site/ReviewList';
import { TourRow } from '@/components/site/TourRow';
import { localizeTour } from '@/data/tours';
import { getDict, href, isLocale, PATHS } from '@/i18n';
import { alternates } from '@/i18n/seo';
import { getSettings } from '@/lib/server/settings';
import { listTours } from '@/lib/server/tours';
import { HydrationBoundary } from '@/components/site/HydrationBoundary';
import s from '@/components/site/site.module.css';

type Props = { params: Promise<{ lang: string }> };

const HOME_TOURS = 6;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { alternates: alternates(lang, '/') };
}

export default async function HomePage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const [all, settings] = await Promise.all([listTours(), getSettings()]);
  // Featured tours first, then the rest in catalogue order.
  const tours = [...all.filter((x) => x.featured), ...all.filter((x) => !x.featured)]
    .slice(0, HOME_TOURS)
    .map((x) => localizeTour(x, lang));

  return (
    <HydrationBoundary>
      <>
        <section className={s.section}>
          <div className={s.wrap}>
            <h1 className={s.h1}>{t.home.title}</h1>
            <p className={s.lead}>{t.home.intro}</p>
            <div className={s.btns}>
              <Link href={href(lang, PATHS.tours)} className={s.btn}>
                {t.home.ctaTours}
              </Link>
              <Link href={href(lang, PATHS.contacts)} className={s.btnLine}>
                {t.home.ctaContact}
              </Link>
            </div>
          </div>
        </section>

        <section className={s.section} aria-labelledby="adv-h">
          <div className={s.wrap}>
            <h2 id="adv-h" className={s.h2}>
              {t.home.advantagesTitle}
            </h2>
            <div className={s.adv}>
              {t.home.advantages.map((a) => (
                <div key={a.title} className={s.advItem}>
                  <span className={s.advDot} aria-hidden>
                    ✓
                  </span>
                  <div>
                    <b>{a.title}</b>
                    <span>{a.text}</span>
                  </div>
                </div>
              ))}
            </div>
            {settings.video && (
              <div className={s.video}>
                <video src={settings.video} controls preload="metadata" playsInline aria-label={t.home.videoTitle} />
              </div>
            )}
          </div>
        </section>

        <section className={s.section} aria-labelledby="tours-h">
          <div className={s.wrap}>
            <h2 id="tours-h" className={s.h2}>
              {t.home.toursTitle}
            </h2>
            <p className={s.sub}>{t.home.toursText}</p>
            <div className={s.tourList}>
              {tours.map((tour, i) => (
                <TourRow key={tour.slug} tour={tour} locale={lang} t={t.common} priority={i === 0} />
              ))}
            </div>
            <div className={s.btns}>
              <Link href={href(lang, PATHS.tours)} className={s.btnLine}>
                {t.common.allTours} ({all.length}) →
              </Link>
            </div>
          </div>
        </section>

        <section className={s.section} aria-labelledby="how-h">
          <div className={s.wrap}>
            <h2 id="how-h" className={s.h2}>
              {t.home.howTitle}
            </h2>
            <ol className={s.steps}>
              {t.home.how.map((step) => (
                <li key={step.title}>
                  <b>{step.title}</b>
                  {step.text}
                </li>
              ))}
            </ol>
            <div className={s.bringBox}>
              <h3 className={s.h3}>{t.home.bringTitle}</h3>
              <ul className={`${s.checks} ${s.dots}`}>
                {t.home.bring.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <ReviewList locale={lang} t={t.home} />

        <section className={s.section} aria-labelledby="fb-h">
          <div className={s.wrap}>
            <h2 id="fb-h" className={s.h2}>
              {t.home.feedbackTitle}
            </h2>
            <p className={s.sub}>{t.home.feedbackText}</p>
            <ContactForm t={t.contact} />
          </div>
        </section>
      </>
    </HydrationBoundary>
  );
}
