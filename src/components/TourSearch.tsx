'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useId, useMemo, useState } from 'react';
import { tourHref } from '@/data/categories';
import type { TourSummary } from '@/data/tours';
import { useLang, useT } from '@/i18n/client';
import { formatPrice } from '@/i18n/format';
import { matchesQuery } from '@/lib/catalog';
import { imageSrc } from '@/lib/images';
import styles from './TourSearch.module.css';

/** Full-list search used by the mobile bottom-nav search panel. */
export function TourSearch({ tours, onNavigate }: { tours: TourSummary[]; onNavigate?: () => void }) {
  const lang = useLang();
  const t = useT();
  const [q, setQ] = useState('');
  const id = useId();
  const found = useMemo(() => tours.filter((x) => matchesQuery(x, q)), [tours, q]);

  return (
    <div className={styles.panel}>
      <label htmlFor={id} className="sr-only">
        {t('search.title')}
      </label>
      <input
        id={id}
        className={styles.input}
        type="search"
        placeholder={t('search.placeholder')}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus
        autoComplete="off"
      />
      <div className={styles.results} aria-live="polite">
        {found.length === 0 ? (
          <p className={styles.empty}>{t('search.empty', { q })}</p>
        ) : (
          found.map((tour) => (
            <Link key={tour.slug} href={tourHref(lang, tour.slug)} className={styles.item} onClick={onNavigate}>
              <span className={styles.thumb}>
                <Image src={imageSrc(tour.cardImage, 160, 120)} alt="" width={64} height={48} />
              </span>
              <span>
                <b>{tour.name}</b>
                <small>
                  {t('search.meta', { category: tour.categoryLabel, duration: tour.duration, price: formatPrice(tour.priceFrom, lang) })}
                </small>
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
