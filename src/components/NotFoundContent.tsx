import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { localeHref } from '@/i18n/routing';
import { SiteHeader } from './SiteHeader';
import styles from '@/app/[lang]/legal.module.css';

/** Body of the 404 page; rendered by app/global-not-found.tsx and app/[lang]/not-found.tsx. */
export function NotFoundContent({ lang }: { lang: Locale }) {
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
