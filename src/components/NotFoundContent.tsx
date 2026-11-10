'use client';

import Link from 'next/link';
import { useT } from '@/i18n/client';
import type { Locale } from '@/i18n/config';
import { localeHref } from '@/i18n/routing';
import { SiteHeader } from './SiteHeader';
import styles from '@/app/[lang]/legal.module.css';

/** Body of the 404 page; rendered by app/global-not-found.tsx and app/[lang]/not-found.tsx. Needs an <I18nProvider>. */
export function NotFoundContent({ lang }: { lang: Locale }) {
  const t = useT();
  return (
    <div className={styles.page}>
      <SiteHeader />
      <main id="main-content" className={styles.main} style={{ textAlign: 'center', minHeight: '70vh' }}>
        <div className={styles.intro}>
          <div className={styles.updated}>404</div>
          <h1 style={{ marginTop: 14 }}>{t('notFound.title')}</h1>
          <p>{t('notFound.text')}</p>
        </div>
        <div className={styles.askBtns} style={{ marginTop: 26 }}>
          <Link href={localeHref(lang, '/sharm/')} className={styles.btn} style={{ background: 'var(--orange)', color: '#fff' }}>
            {t('notFound.browse')}
          </Link>
          <Link href={localeHref(lang, '/')} className={styles.btn}>
            {t('notFound.home')}
          </Link>
        </div>
      </main>
    </div>
  );
}
