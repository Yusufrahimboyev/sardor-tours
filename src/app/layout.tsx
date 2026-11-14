import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import { isLocale, LOCALE_TAG } from '@/i18n/config';
import { Inter, Plus_Jakarta_Sans, Poppins } from 'next/font/google';
import { site } from '@/data/site';
import { ToastProvider } from '@/components/Toast';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const poppins = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-poppins', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Egypt Excursions in Sharm El Sheikh, Hurghada, Cairo & Marsa Alam`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  openGraph: { type: 'website', siteName: site.name, locale: 'en_GB' },
  twitter: { card: 'summary_large_image' },
  
};

/**
 * Public-site theme: the visitor's saved choice, else their system setting. The admin panel has
 * its own theme switch (cookie), so it is skipped here.
 */
const THEME_SCRIPT = `(function(){try{if(location.pathname.indexOf('/admin')===0)return;var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t}catch(e){}})()`;

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Set by middleware for /{locale}/… pages; admin and other routes fall back to English.
  const h = await headers();
  const loc = h.get('x-locale');
  const lang = isLocale(loc) ? LOCALE_TAG[loc] : 'en';
  return (
    <html lang={lang} className={`${jakarta.variable} ${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <head>
        {/* Runs before first paint so the page never flashes the wrong theme. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
