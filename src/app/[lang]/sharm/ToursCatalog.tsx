'use client';

import { useEffect, useMemo, useState } from 'react';
import { TourCard } from '@/components/TourCard';
import { XIcon } from '@/components/icons';
import type { Category } from '@/data/categories';
import type { TourSummary } from '@/data/tours';
import { filterTours, PRICE_BANDS, type PriceBand } from '@/lib/catalog';
import styles from './sharm.module.css';

export const CATALOG_QUERY = 'st:catalog-query';

type CatFilter = Category | 'all';

type CategoryItem = { key: Category; label: string; tag: string };

function readUrl(categories: CategoryItem[]): { cat: CatFilter; price: PriceBand; q: string } {
  const sp = new URLSearchParams(window.location.search);
  const cat = sp.get('cat');
  const price = sp.get('price');
  return {
    cat: categories.some((c) => c.key === cat) ? (cat as Category) : 'all',
    price: PRICE_BANDS.some((b) => b.key === price) ? (price as PriceBand) : 'all',
    q: sp.get('q') ?? '',
  };
}

export function ToursCatalog({ categories, tours }: { categories: CategoryItem[]; tours: TourSummary[] }) {
  const [cat, setCat] = useState<CatFilter>('all');
  const [price, setPrice] = useState<PriceBand>('all');
  const [query, setQuery] = useState('');

  // Initial state from the URL (?cat=sea&price=under30&q=boat) so filters are shareable.
  useEffect(() => {
    const s = readUrl(categories);
    setCat(s.cat);
    setPrice(s.price);
    setQuery(s.q);
    const onQuery = (e: Event) => setQuery((e as CustomEvent<string>).detail);
    window.addEventListener(CATALOG_QUERY, onQuery);
    return () => window.removeEventListener(CATALOG_QUERY, onQuery);
  }, [categories]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const set = (k: string, v: string, def: string) => (v === def ? url.searchParams.delete(k) : url.searchParams.set(k, v));
    set('cat', cat, 'all');
    set('price', price, 'all');
    set('q', query.trim(), '');
    window.history.replaceState(window.history.state, '', url);
  }, [cat, price, query]);

  const filtered = useMemo(() => filterTours(tours, { category: cat, price, query }), [tours, cat, price, query]);
  const sections = categories.map((c) => ({ ...c, items: filtered.filter((t) => t.category === c.key) })).filter(
    (s) => s.items.length > 0,
  );
  const isFiltered = cat !== 'all' || price !== 'all' || query.trim() !== '';
  const reset = () => {
    setCat('all');
    setPrice('all');
    setQuery('');
  };

  return (
    <>
      <div className={styles.filters}>
        <div className={styles.filterRow} role="group" aria-label="Filter by category">
          {[{ key: 'all' as const, label: 'All Tours' }, ...categories].map((c) => (
            <button
              key={c.key}
              type="button"
              className={`${styles.pill} ${cat === c.key ? styles.on : ''}`}
              aria-pressed={cat === c.key}
              onClick={() => setCat(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className={styles.filterRow} role="group" aria-label="Filter by price">
          {PRICE_BANDS.map((b) => (
            <button
              key={b.key}
              type="button"
              className={`${styles.pill} ${styles.pillSm} ${price === b.key ? styles.onInk : ''}`}
              aria-pressed={price === b.key}
              onClick={() => setPrice(b.key)}
            >
              {b.label}
            </button>
          ))}
        </div>
        {isFiltered && (
          <p className={styles.resultLine} aria-live="polite">
            <span data-testid="result-count">
              {filtered.length} {filtered.length === 1 ? 'tour' : 'tours'} found
            </span>
            {query.trim() && <> for &ldquo;{query.trim()}&rdquo;</>}
            <button type="button" onClick={reset} className={styles.clear}>
              <XIcon size={13} /> Clear filters
            </button>
          </p>
        )}
      </div>

      {sections.length === 0 ? (
        <div className={styles.empty}>
          <p>No tours match these filters.</p>
          <button type="button" className={styles.pill} onClick={reset}>
            Show all tours
          </button>
        </div>
      ) : (
        sections.map((s) => (
          <div key={s.key} className={styles.catSection} data-cat={s.key}>
            <div className={styles.catHead}>
              <div>
                <h3 className={styles.catName}>{s.label}</h3>
                <div className={styles.catTag}>{s.tag}</div>
              </div>
              <div className={styles.catCount} aria-hidden>
                {s.items.length}
                <span> tours</span>
              </div>
            </div>
            <div className={styles.grid}>
              {s.items.map((t) => (
                <TourCard key={t.slug} tour={t} />
              ))}
            </div>
          </div>
        ))
      )}
    </>
  );
}
