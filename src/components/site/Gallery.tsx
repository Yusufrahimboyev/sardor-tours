'use client';

import Image from 'next/image';
import { useState } from 'react';
import { imageSrc } from '@/lib/images';
import s from './site.module.css';

/** Simple photo viewer: one large image, arrows, counter and a thumbnail strip. */
export function Gallery({ photos, alt, labels }: { photos: string[]; alt: string; labels: { prev: string; next: string; photo: string; of: string } }) {
  const [i, setI] = useState(0);
  if (!photos.length) return null;
  const go = (n: number) => setI((n + photos.length) % photos.length);

  return (
    <div>
      <div
        className={s.gallery}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') go(i - 1);
          if (e.key === 'ArrowRight') go(i + 1);
        }}
      >
        <Image src={imageSrc(photos[i], 1400, 930)} alt={`${alt} — ${labels.photo} ${i + 1}`} fill sizes="(max-width: 940px) 100vw, 880px" priority={i === 0} />
        {photos.length > 1 && (
          <>
            <button type="button" className={`${s.galBtn} ${s.galPrev}`} onClick={() => go(i - 1)} aria-label={labels.prev}>
              ‹
            </button>
            <button type="button" className={`${s.galBtn} ${s.galNext}`} onClick={() => go(i + 1)} aria-label={labels.next}>
              ›
            </button>
            <span className={s.galCount} aria-live="polite">
              {i + 1} {labels.of} {photos.length}
            </span>
          </>
        )}
      </div>
      {photos.length > 1 && (
        <div className={s.thumbs}>
          {photos.map((p, n) => (
            <button key={p + n} type="button" onClick={() => setI(n)} aria-current={n === i} aria-label={`${labels.photo} ${n + 1}`}>
              <Image src={imageSrc(p, 200, 140)} alt="" fill sizes="84px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
