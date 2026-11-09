import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans, Poppins } from 'next/font/google';
import { site } from '@/data/site';
import { RevealObserver } from '@/components/RevealObserver';
import { ToastProvider } from '@/components/Toast';
import { LOCALES, OG_LOCALE } from '@/i18n/config';
import { langFrom } from '@/i18n/params';
import '../globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const poppins = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-poppins', display: 'swap' });

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = await langFrom(params);
  return {
    metadataBase: new URL(site.url),
    title: {
      default: `${site.name} — Egypt Excursions in Sharm El Sheikh, Hurghada, Cairo & Marsa Alam`,
      template: `%s | ${site.name}`,
    },
    description: site.description,
    applicationName: site.name,
    openGraph: { type: 'website', siteName: site.name, locale: OG_LOCALE[lang] },
    twitter: { card: 'summary_large_image' },
  };
}

export const dynamicParams = false;

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

  return (
    <html lang={lang} className={`${jakarta.variable} ${inter.variable} ${poppins.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <noscript>
          <style>{'.reveal{opacity:1!important;transform:none!important}'}</style>
        </noscript>
        <ToastProvider>{children}</ToastProvider>
        <RevealObserver />
      </body>
    </html>
  );
}
