import Image from 'next/image';
import Link from 'next/link';
import type { Tour } from '@/data/tours';
import { fill, weekdayList, type Dict } from '@/i18n';
import { tourPath, type Locale } from '@/i18n/config';
import { imageSrc } from '@/lib/images';
import s from './site.module.css';

/** One excursion in the single-column list: photo, name, facts, short text, price. */
export function TourRow({ tour, locale, t, priority }: { tour: Tour; locale: Locale; t: Dict['common']; priority?: boolean }) {
  const link = tourPath(locale, tour.slug);
  const unit = tour.priceUnit ?? t.perPerson;
  return (
    <article className={s.tourRow}>
      <Link href={link} className={s.tourImg} tabIndex={-1} aria-hidden>
        {tour.cardImage && (
          <Image src={imageSrc(tour.cardImage, 640, 440)} alt="" fill sizes="(max-width: 640px) 100vw, 240px" priority={priority} />
        )}
      </Link>
      <div className={s.tourBody}>
        <h3 className={s.h3}>
          <Link href={link}>{tour.name}</Link>
        </h3>
        <div className={s.tourMeta}>
          {[tour.duration, tour.scheduleDays ? weekdayList(locale, tour.scheduleDays) : tour.schedule].filter(Boolean).join(' · ')}
        </div>
        {tour.excerpt && <p>{tour.excerpt}</p>}
        <div className={s.tourFoot}>
          <span className={s.price}>
            {fill(t.priceFrom, { price: `£${tour.priceFrom}` })} <small>{unit}</small>
          </span>
          <Link href={link} className={s.more}>
            {t.details} →
          </Link>
        </div>
      </div>
    </article>
  );
}
