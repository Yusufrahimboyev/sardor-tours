'use client';

import { useRef, useState } from 'react';
import type { Review } from '@/data/reviews';
import { imageSrc } from '@/lib/images';
import styles from './ReviewsSection.module.css';

const AVATAR_COLORS = ['#4f8a6e', '#8e44ad', '#2f6fb3', '#c0392b', '#d35400', '#16a085'];

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function SourceIcon({ source }: { source: Review['source'] }) {
  if (source === 'google')
    return (
      <svg viewBox="0 0 48 48" width="22" height="22" aria-label="Google review">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
        <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
      </svg>
    );
  if (source === 'tripadvisor')
    return (
      <span className={styles.rvSrcText} aria-label="Tripadvisor review">
        TA
      </span>
    );
  return null;
}

function ReviewCard({ r, i }: { r: Review; i: number }) {
  const [open, setOpen] = useState(false);
  return (
    <article className={styles.rvCard}>
      <header className={styles.rvCardHead}>
        <span className={styles.rvAvatar} style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }} aria-hidden>
          {r.name.charAt(0).toUpperCase()}
        </span>
        <div className={styles.rvWho}>
          <b>{r.name}</b>
          <time dateTime={r.date}>{formatDate(r.date)}</time>
        </div>
        <SourceIcon source={r.source} />
      </header>
      <div className={styles.rvCardStars} aria-label={`${r.rating} out of 5 stars`}>
        {'★'.repeat(r.rating)}
        <span>{'★'.repeat(5 - r.rating)}</span>
      </div>
      <div className={styles.rvBody}>
        <p className={open ? undefined : styles.rvClamp}>{r.text}</p>
        {r.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.rvPhoto} src={imageSrc(r.photo, 160, 160)} alt="" loading="lazy" width={64} height={64} />
        )}
      </div>
      {r.text.length > 110 && (
        <button type="button" className={styles.rvMore} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? 'Show less' : 'Read more'}
        </button>
      )}
    </article>
  );
}

export function ReviewsCarousel({ items }: { items: Review[] }) {
  const track = useRef<HTMLDivElement>(null);
  if (!items.length) return null;

  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector('article');
    const step = card ? card.getBoundingClientRect().width + 20 : el.clientWidth;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  return (
    <div className={styles.rvCarousel}>
      <button type="button" className={`${styles.rvArrow} ${styles.rvPrev}`} onClick={() => scroll(-1)} aria-label="Previous reviews">
        ‹
      </button>
      <div ref={track} className={styles.rvTrack}>
        {items.map((r, i) => (
          <ReviewCard key={`${r.name}-${r.date}`} r={r} i={i} />
        ))}
      </div>
      <button type="button" className={`${styles.rvArrow} ${styles.rvNext}`} onClick={() => scroll(1)} aria-label="Next reviews">
        ›
      </button>
    </div>
  );
}
