'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useId, useMemo, useState } from 'react';
import { tourHref, type TourSummary } from '@/data/tours';
import { matchesQuery } from '@/lib/catalog';
import { imageSrc } from '@/lib/images';
import styles from './TourSearch.module.css';

/** Full-list search used by the mobile bottom-nav search panel. */
export function TourSearch({ tours, onNavigate }: { tours: TourSummary[]; onNavigate?: () => void }) {
  const [q, setQ] = useState('');
  const id = useId();
  const found = useMemo(() => tours.filter((t) => matchesQuery(t, q)), [tours, q]);

  return (
    <div className={styles.panel}>
      <label htmlFor={id} className="sr-only">
        Search tours
      </label>
      <input
        id={id}
        className={styles.input}
        type="search"
        placeholder="Search tours…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus
        autoComplete="off"
      />
      <div className={styles.results} aria-live="polite">
        {found.length === 0 ? (
          <p className={styles.empty}>No tours found for &ldquo;{q}&rdquo;</p>
        ) : (
          found.map((t) => (
            <Link key={t.slug} href={tourHref(t.slug)} className={styles.item} onClick={onNavigate}>
              <span className={styles.thumb}>
                <Image src={imageSrc(t.cardImage, 160, 120)} alt="" width={64} height={48} />
              </span>
              <span>
                <b>{t.name}</b>
                <small>
                  {t.categoryLabel} · {t.duration} · from £{t.priceFrom}
                </small>
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
