'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from '@/components/icons';
import { Modal } from '@/components/Modal';
import { useT } from '@/i18n/client';
import { imageSrc } from '@/lib/images';
import styles from './tour.module.css';

interface Props {
  images: { src: string; w: number; h: number }[];
  alt: string;
}

function useSlider(count: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  const onScroll = useCallback(() => {
    const el = ref.current;
    if (el) setIdx(Math.round(el.scrollLeft / Math.max(el.clientWidth, 1)));
  }, []);

  const goTo = useCallback(
    (i: number, smooth = true) => {
      const el = ref.current;
      if (!el) return;
      const n = (i + count) % count;
      el.scrollTo({ left: n * el.clientWidth, behavior: smooth ? 'smooth' : 'auto' });
    },
    [count],
  );
  return { ref, idx, goTo, onScroll };
}

/** Swipeable photo gallery with arrows, dots, counter and a fullscreen viewer. */
export function Gallery({ images, alt }: Props) {
  const t = useT();
  const main = useSlider(images.length);
  const full = useSlider(images.length);
  const [fullOpen, setFullOpen] = useState(false);

  useEffect(() => {
    if (fullOpen) requestAnimationFrame(() => full.goTo(main.idx, false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullOpen]);

  const onKey = (e: React.KeyboardEvent, s: ReturnType<typeof useSlider>) => {
    if (e.key === 'ArrowRight') s.goTo(s.idx + 1);
    if (e.key === 'ArrowLeft') s.goTo(s.idx - 1);
  };

  return (
    <div className={styles.gallery}>
      <div
        ref={main.ref}
        onScroll={main.onScroll}
        className={styles.gScroll}
        role="region"
        aria-roledescription="carousel"
        aria-label={t('gallery.region')}
        tabIndex={0}
        onKeyDown={(e) => onKey(e, main)}
      >
        {images.map((im, i) => (
          <button
            key={im.src + i}
            type="button"
            className={styles.gSlide}
            onClick={() => setFullOpen(true)}
            aria-label={t('gallery.open', { i: i + 1, n: images.length })}
          >
            <Image
              src={imageSrc(im.src, 1200, 800)}
              alt={t('gallery.alt', { alt, i: i + 1 })}
              fill
              sizes="(max-width: 1100px) 100vw, 760px"
              priority={i === 0}
            />
          </button>
        ))}
      </div>
      <button type="button" className={`${styles.gBtn} ${styles.gL}`} onClick={() => main.goTo(main.idx - 1)} aria-label={t('gallery.prev')}>
        <ChevronLeft />
      </button>
      <button type="button" className={`${styles.gBtn} ${styles.gR}`} onClick={() => main.goTo(main.idx + 1)} aria-label={t('gallery.next')}>
        <ChevronRight />
      </button>
      <div className={styles.gCounter} aria-live="polite">
        {main.idx + 1} / {images.length}
      </div>
      <div className={styles.gDots}>
        {images.slice(0, 10).map((_, i) => (
          <button
            key={i}
            type="button"
            className={i === Math.min(main.idx, 9) ? styles.gDotOn : ''}
            onClick={() => main.goTo(i)}
            aria-label={t('gallery.photo', { i: i + 1 })}
            aria-current={i === main.idx}
          />
        ))}
      </div>

      <Modal open={fullOpen} onClose={() => setFullOpen(false)} label={t('gallery.viewer')} variant="panel" className={styles.viewer}>
        <div ref={full.ref} onScroll={full.onScroll} className={styles.vScroll} tabIndex={0} onKeyDown={(e) => onKey(e, full)}>
          {images.map((im, i) => (
            <div key={im.src + i} className={styles.vSlide}>
              <Image src={imageSrc(im.src, 1600, 1066)} alt={t('gallery.alt', { alt, i: i + 1 })} fill sizes="100vw" />
            </div>
          ))}
        </div>
        <button type="button" className={`${styles.gBtn} ${styles.gL}`} onClick={() => full.goTo(full.idx - 1)} aria-label={t('gallery.prev')}>
          <ChevronLeft />
        </button>
        <button type="button" className={`${styles.gBtn} ${styles.gR}`} onClick={() => full.goTo(full.idx + 1)} aria-label={t('gallery.next')}>
          <ChevronRight />
        </button>
        <div className={styles.gCounter}>
          {full.idx + 1} / {images.length}
        </div>
      </Modal>
    </div>
  );
}
