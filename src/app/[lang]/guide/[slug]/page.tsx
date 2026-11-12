import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleBody } from '@/components/site/ArticleBody';
import { TourRow } from '@/components/site/TourRow';
import { site } from '@/data/site';
import { localizeTour } from '@/data/tours';
import { getDict, href, isLocale, LOCALE_TAG, LOCALES, PATHS } from '@/i18n';
import { alternates } from '@/i18n/seo';
import { imageSrc } from '@/lib/images';
import { articleText, getArticle, listArticles } from '@/lib/server/articles';
import { listTours } from '@/lib/server/tours';
import { HydrationBoundary } from '@/components/site/HydrationBoundary';
import s from '@/components/site/site.module.css';

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateStaticParams() {
  const articles = await listArticles();
  return LOCALES.flatMap((lang) => articles.map((a) => ({ lang, slug: a.slug })));
}
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const a = await getArticle(slug);
  if (!a) return {};
  const tx = articleText(a, lang);
  return {
    title: tx.title,
    description: tx.excerpt,
    alternates: alternates(lang, `/guide/${slug}/`),
    // A page showing the English fallback shouldn't compete with the real English page.
    robots: tx.fallback ? { index: false, follow: true } : undefined,
    openGraph: {
      type: 'article',
      title: tx.title,
      description: tx.excerpt,
      images: a.cover ? [{ url: imageSrc(a.cover, 1200, 630) }] : [],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const a = await getArticle(slug);
  if (!a) notFound();
  const t = getDict(lang);
  const tx = articleText(a, lang);
  const tours = (await listTours()).filter((x) => a.relatedTours.includes(x.slug)).map((x) => localizeTour(x, lang));

  return (
    <HydrationBoundary>
      <article className={s.section}>
        <div className={s.wrap}>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Article',
                headline: tx.title,
                description: tx.excerpt,
                inLanguage: LOCALE_TAG[lang],
                datePublished: a.createdAt,
                dateModified: a.updatedAt ?? a.createdAt,
                publisher: { '@type': 'Organization', name: site.name },
              }).replace(/</g, '\\u003c'),
            }}
          />
          <nav className={s.crumbs} style={{ paddingTop: 0 }} aria-label="Breadcrumb">
            <Link href={href(lang, PATHS.guide)}>← {t.guide.back}</Link>
          </nav>
          <h1 className={s.h1} style={{ marginTop: 12 }}>
            {tx.title}
          </h1>
          {tx.excerpt && <p className={s.lead}>{tx.excerpt}</p>}
          {a.cover && (
            <div className={s.cover}>
              <Image src={imageSrc(a.cover, 1400, 700)} alt="" fill sizes="(max-width: 940px) 100vw, 880px" priority />
            </div>
          )}
          <ArticleBody body={tx.body} />

          {tours.length > 0 && (
            <section style={{ marginTop: 40 }} aria-labelledby="art-tours-h">
              <h2 id="art-tours-h" className={s.h2}>
                {t.guide.related}
              </h2>
              <div className={s.tourList} style={{ marginTop: 16 }}>
                {tours.map((x) => (
                  <TourRow key={x.slug} tour={x} locale={lang} t={t.common} />
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </HydrationBoundary>
  );
}
