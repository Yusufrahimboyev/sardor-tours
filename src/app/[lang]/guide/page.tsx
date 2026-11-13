import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { articlePath, getDict, isLocale } from '@/i18n';
import { alternates } from '@/i18n/seo';
import { imageSrc } from '@/lib/images';
import { articleText, listArticles } from '@/lib/server/articles';
import { HydrationBoundary } from '@/components/site/HydrationBoundary';
import s from '@/components/site/site.module.css';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDict(lang);
  return {
    title: t.guide.title,
    description: t.guide.intro,
    alternates: alternates(lang, '/guide/'),
  };
}

export default async function GuidePage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const articles = await listArticles();
  return (
    <HydrationBoundary>
      <section className={s.section}>
        <div className={s.wrap}>
          <h1 className={s.h1}>{t.guide.title}</h1>
          <p className={s.lead} style={{ marginBottom: 28 }}>
            {t.guide.intro}
          </p>
          {articles.length === 0 ? (
            <p>{t.guide.empty}</p>
          ) : (
            <div className={s.articles}>
              {articles.map((a) => {
                const tx = articleText(a, lang);
                const link = articlePath(lang, a.slug);
                return (
                  <article key={a.id} className={s.article}>
                    <Link href={link} className={s.articleImg} tabIndex={-1} aria-hidden>
                      {a.cover && <Image src={imageSrc(a.cover, 480, 360)} alt="" fill sizes="(max-width: 640px) 100vw, 200px" />}
                    </Link>
                    <div>
                      <h2 className={s.h3}>
                        <Link href={link}>{tx.title}</Link>
                      </h2>
                      <p style={{ marginTop: 6 }}>{tx.excerpt}</p>
                      <Link href={link} className={s.more}>
                        {t.common.readMore} →
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </HydrationBoundary>
  );
}
