import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDict, href, isLocale, PATHS } from '@/i18n';
import { alternates } from '@/i18n/seo';
import { HydrationBoundary } from '@/components/site/HydrationBoundary';
import s from '@/components/site/site.module.css';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDict(lang);
  return {
    title: t.about.title,
    description: t.about.lead,
    alternates: alternates(lang, '/about/'),
  };
}

export default async function AboutPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  return (
    <HydrationBoundary>
      <>
        <section className={s.section}>
          <div className={`${s.wrap} ${s.prose}`}>
            <h1 className={s.h1}>{t.about.title}</h1>
            <p className={s.lead}>{t.about.lead}</p>
            {t.about.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </section>
        <section className={s.section} aria-labelledby="values-h">
          <div className={s.wrap}>
            <h2 id="values-h" className={s.h2}>
              {t.about.valuesTitle}
            </h2>
            <div className={s.adv}>
              {t.about.values.map((v) => (
                <div key={v.title} className={s.advItem}>
                  <span className={s.advDot} aria-hidden>
                    ✓
                  </span>
                  <div>
                    <b>{v.title}</b>
                    <span>{v.text}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className={s.btns}>
              <Link href={href(lang, PATHS.tours)} className={s.btn}>
                {t.common.allTours}
              </Link>
              <Link href={href(lang, PATHS.contacts)} className={s.btnLine}>
                {t.nav.contacts}
              </Link>
            </div>
          </div>
        </section>
      </>
    </HydrationBoundary>
  );
}
