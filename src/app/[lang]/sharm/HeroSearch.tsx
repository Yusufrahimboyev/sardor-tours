'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { SearchIcon } from '@/components/icons';
import { tourHref } from '@/data/categories';
import type { TourSummary } from '@/data/tours';
import { useT } from '@/i18n/client';
import type { Locale } from '@/i18n/config';
import { formatPrice } from '@/i18n/format';
import { matchesQuery } from '@/lib/catalog';
import { imageSrc } from '@/lib/images';
import { CATALOG_QUERY } from './ToursCatalog';
import styles from './sharm.module.css';

export function HeroSearch({ lang, tours }: { lang: Locale; tours: TourSummary[] }) {
  const t = useT();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLFormElement>(null);
  const listId = useId();
  const found = useMemo(() => (q.trim() ? tours.filter((x) => matchesQuery(x, q)).slice(0, 6) : []), [tours, q]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  return (
    <form
      ref={root}
      className={styles.heroSearch}
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        setOpen(false);
        window.dispatchEvent(new CustomEvent(CATALOG_QUERY, { detail: q }));
        document.getElementById('tours')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }}
    >
      <SearchIcon />
      <input
        className={styles.heroSearchInp}
        type="search"
        autoComplete="off"
        placeholder={t('search.placeholder')}
        aria-label={t('search.title')}
        role="combobox"
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={open && q.trim() !== ''}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
      />
      <button type="submit" className={styles.heroSearchBtn}>
        {t('search.button')}
      </button>
      <div id={listId} className={`${styles.heroResults} ${open && q.trim() ? styles.heroResultsOpen : ''}`}>
        {found.length ? (
          found.map((tour) => (
            <Link key={tour.slug} href={tourHref(lang, tour.slug)} className={styles.heroResult}>
              <span className={styles.heroResultImg}>
                <Image src={imageSrc(tour.cardImage, 160, 120)} alt="" width={44} height={38} />
              </span>
              <span>
                <b>{tour.name}</b>
                <small>
                  {t('search.meta', { category: tour.categoryLabel, duration: tour.duration, price: formatPrice(tour.priceFrom, lang) })}
                </small>
              </span>
            </Link>
          ))
        ) : (
          <div className={styles.heroNoResult}>{t('search.empty', { q })}</div>
        )}
      </div>
    </form>
  );
}
