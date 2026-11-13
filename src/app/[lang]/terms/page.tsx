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
  return {
    title: getDict(lang).terms.title,
    alternates: alternates(lang, '/terms/'),
  };
}

export default async function TermsPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  return (
    <HydrationBoundary>
      <section className={s.section}>
        <div className={`${s.wrap} ${s.prose}`}>
          <h1 className={s.h1}>{t.terms.title}</h1>
          <p className={s.hint}>{t.terms.updated}</p>
          {t.terms.sections.map((sec) => (
            <div key={sec.title}>
              <h2>{sec.title}</h2>
              <ul>
                {sec.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
          <p style={{ marginTop: 24 }}>
            <Link href={href(lang, PATHS.contacts)} className={s.more}>
              {t.terms.questions} →
            </Link>
          </p>
        </div>
      </section>
    </HydrationBoundary>
  );
}
