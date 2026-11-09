'use client';

import Link from 'next/link';
import { site } from '@/data/site';
import { useLang, useT } from '@/i18n/client';
import { localeHref } from '@/i18n/routing';
import styles from './Brand.module.css';

/** Logo mark + wordmark. The original logo artwork is not reused; this is a neutral SVG mark. */
export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden className={styles.mark}>
      <rect width="64" height="64" rx="16" fill="#FF6B00" />
      <circle cx="32" cy="27" r="9" fill="#fff" />
      <path d="M10 42c4-3 8-3 11 0s7 3 11 0 7-3 11 0 7 3 11 0" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path
        d="M10 51c4-3 8-3 11 0s7 3 11 0 7-3 11 0 7 3 11 0"
        stroke="#fff"
        strokeOpacity=".6"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Brand({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const lang = useLang();
  const t = useT();
  return (
    <Link href={localeHref(lang, '/')} className={`${styles.brand} ${tone === 'dark' ? styles.dark : ''}`} aria-label={t('common.homeAria', { name: site.name })}>
      <LogoMark />
      <span>
        <span className={styles.bt}>{site.name}</span>
        <span className={styles.bs}>{t('common.tagline')}</span>
      </span>
    </Link>
  );
}
