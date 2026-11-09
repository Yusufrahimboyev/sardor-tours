'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { DEFAULT_LOCALE, isLocale } from '@/i18n/config';
import { localeHref } from '@/i18n/routing';
import styles from './legal.module.css';

/** not-found.tsx receives no props, so the locale is read from the route params on the client. */
export default function NotFound() {
  const { lang: raw } = useParams<{ lang?: string }>();
  const lang = isLocale(raw) ? raw : DEFAULT_LOCALE;
  return (
    <div className={styles.page}>
      <SiteHeader lang={lang} />
      <main id="main-content" className={styles.main} style={{ textAlign: 'center', minHeight: '70vh' }}>
        <div className={styles.intro}>
          <div className={styles.updated}>404</div>
          <h1 style={{ marginTop: 14 }}>This page sailed away</h1>
          <p>The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        </div>
        <div className={styles.askBtns} style={{ marginTop: 26 }}>
          <Link href={localeHref(lang, '/sharm/')} className={styles.btn} style={{ background: 'var(--orange)', color: '#fff' }}>
            Browse excursions
          </Link>
          <Link href={localeHref(lang, '/')} className={styles.btn}>
            Home
          </Link>
        </div>
      </main>
    </div>
  );
}
