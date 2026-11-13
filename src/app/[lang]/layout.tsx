import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import { site } from '@/data/site';
import { getDict, isLocale, LOCALES, LOCALE_TAG } from '@/i18n';
import { getContacts } from '@/lib/server/settings';
import s from '@/components/site/site.module.css';

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}
export const dynamicParams = false;

type Props = { children: React.ReactNode; params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDict(lang);
  return {
    title: { default: `${t.meta.siteTitle} | ${site.name}`, template: `%s | ${site.name}` },
    description: t.meta.siteDescription,
    openGraph: { siteName: site.name, locale: LOCALE_TAG[lang].replace('-', '_'), type: 'website' },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const contacts = await getContacts(lang);
  return (
    <div className={s.page}>
      <SiteHeader locale={lang} t={t.nav} />
      <main id="main-content" tabIndex={-1} className={s.main}>
        {children}
      </main>
      <SiteFooter locale={lang} t={t} contacts={contacts} />
    </div>
  );
}
