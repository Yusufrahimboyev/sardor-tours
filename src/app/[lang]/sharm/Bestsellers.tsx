'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useT } from '@/i18n/client';
import { imageSrc } from '@/lib/images';
import styles from './sharm.module.css';

interface Item {
  href: string;
  name: string;
  tag: string;
  image: string;
}

/** Bestseller slider: scroll-snap track, dots, autoplay that pauses on interaction. */
export function Bestsellers({ items, variant }: { items: Item[]; variant?: 'related' }) {
  const rel = variant === 'related';
  const t = useT();
  const track = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((i: number) => {
    const el = track.current;
    const card = el?.children[i] as HTMLElement | undefined;
    // Track is position:relative, so offsetLeft is measured from the track; centre the card.
    if (el && card) el.scrollTo({ left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => {
      const mid = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      Array.from(el.children).forEach((c, i) => {
        const card = c as HTMLElement;
        const d = Math.abs(card.offsetLeft + card.offsetWidth / 2 - mid);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      setIdx(best);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => goTo((idx + 1) % items.length), 4500);
    return () => clearInterval(t);
  }, [idx, paused, items.length, goTo]);

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)}>
      <div ref={track} className={styles.bsTrack} onPointerDown={() => setPaused(true)}>
        {items.map((it, i) => (
          <Link key={it.href} href={it.href} className={`${styles.bsCard} ${rel ? styles.bsCardRel : ''} ${i === idx ? styles.bsCardOn : ''}`} aria-label={t('bestsellers.item', { name: it.name, i: i + 1, n: items.length })}>
            <Image src={imageSrc(it.image, 1100, 680)} alt="" fill sizes="(max-width: 700px) 88vw, 600px" />
            <div className={styles.bsGrad} />
            {rel ? (
              <div className={styles.bsBodyRel}>
                <span className={styles.bsNameRel}>{it.name}</span>
                <span className={styles.bsBtn}>{t('bestsellers.details')}</span>
              </div>
            ) : (
              <div className={styles.bsBody}>
                <span className={styles.bsTag}>{it.tag}</span>
                <span className={styles.bsName}>{it.name}</span>
              </div>
            )}
          </Link>
        ))}
      </div>
      <div className={`${styles.bsDots} ${rel ? styles.bsDotsRel : ''}`}>
        {items.map((it, i) => (
          <button
            key={it.href}
            type="button"
            className={i === idx ? styles.dotOn : ''}
            aria-label={t('bestsellers.slide', { i: i + 1 })}
            aria-current={i === idx}
            onClick={() => {
              setPaused(true);
              goTo(i);
            }}
          />
        ))}
      </div>
    </div>
  );
}
