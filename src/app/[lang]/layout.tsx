import type { Metadata, Viewport } from 'next';
import { site } from '@/data/site';
import { RevealObserver } from '@/components/RevealObserver';
import { ToastProvider } from '@/components/Toast';
import { I18nProvider } from '@/i18n/client';
import { LOCALES, OG_LOCALE } from '@/i18n/config';
import { getMessages, getT } from '@/i18n/messages';
import { langFrom } from '@/i18n/params';
import { fontVariables } from '../fonts';
import '../globals.css';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = await langFrom(params);
  const t = getT(lang);
  return {
    metadataBase: new URL(site.url),
    title: {
      default: t('meta.default.title', { name: site.name }),
      template: `%s | ${site.name}`,
    },
    description: t('meta.default.description'),
    applicationName: site.name,
    openGraph: { type: 'website', siteName: site.name, locale: OG_LOCALE[lang] },
    twitter: { card: 'summary_large_image' },
  };
}

// No `dynamicParams = false` here: after the admin panel revalidates the site, Next refuses to
// regenerate prerendered pages under a closed param set. `langFrom` 404s on unknown locales instead.

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: '#050a1a',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const lang = await langFrom(params);
  const t = getT(lang);

  return (
    <html lang={lang} className={fontVariables}>
      <body>
        <a href="#main-content" className="skip-link">
          {t('common.skipToContent')}
        </a>
        <noscript>
          <style>{'.reveal{opacity:1!important;transform:none!important}'}</style>
        </noscript>
        <I18nProvider lang={lang} messages={getMessages(lang).client}>
          <ToastProvider>{children}</ToastProvider>
        </I18nProvider>
        <RevealObserver />
      </body>
    </html>
  );
}
