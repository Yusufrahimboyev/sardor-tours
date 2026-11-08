'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from './icons';
import styles from './ReviewsCarousel.module.css';

interface Review {
  text: string;
  author: string;
  tour?: string;
}

/** Scroll-snap carousel of guest reviews (stands in for the 3rd-party Trustindex widget). */
export function ReviewsCarousel({ reviews, tone = 'light' }: { reviews: Review[]; tone?: 'light' | 'dark' }) {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.85, 640), behavior: 'smooth' });
  };

  return (
    <div className={`${styles.root} ${tone === 'dark' ? styles.dark : ''}`}>
      <div ref={track} className={styles.track} tabIndex={0} aria-label="Guest reviews" role="region">
        {reviews.map((r, i) => (
          <figure key={i} className={styles.card}>
            <div className={styles.stars} aria-label="5 out of 5 stars">
              ★★★★★
            </div>
            <blockquote>{r.text}</blockquote>
            <figcaption>
              <b>{r.author}</b>
              {r.tour && <span>{r.tour}</span>}
            </figcaption>
          </figure>
        ))}
      </div>
      <div className={styles.ctrls}>
        <button type="button" onClick={() => scroll(-1)} aria-label="Previous reviews">
          <ChevronLeft />
        </button>
        <button type="button" onClick={() => scroll(1)} aria-label="Next reviews">
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
