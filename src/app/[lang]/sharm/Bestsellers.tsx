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
export function Bestsellers({ items }: { items: Item[] }) {
  const t = useT();
  const track = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((i: number) => {
    const el = track.current;
    const card = el?.children[i] as HTMLElement | undefined;
    if (el && card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => {
      const w = (el.children[0] as HTMLElement | undefined)?.offsetWidth ?? 1;
      setIdx(Math.round(el.scrollLeft / (w + 16)));
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
          <Link key={it.href} href={it.href} className={styles.bsCard} aria-label={t('bestsellers.item', { name: it.name, i: i + 1, n: items.length })}>
            <Image src={imageSrc(it.image, 1100, 680)} alt="" fill sizes="(max-width: 700px) 88vw, 600px" />
            <div className={styles.bsGrad} />
            <div className={styles.bsBody}>
              <span className={styles.bsTag}>{it.tag}</span>
              <span className={styles.bsName}>{it.name}</span>
            </div>
          </Link>
        ))}
      </div>
      <div className={styles.bsDots}>
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
