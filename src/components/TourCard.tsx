'use client';

import Image from 'next/image';
import Link from 'next/link';
import { tourHref } from '@/data/categories';
import { site } from '@/data/site';
import type { TourSummary } from '@/data/tours';
import { useLang, useT } from '@/i18n/client';
import { formatPrice } from '@/i18n/format';
import { imageSrc } from '@/lib/images';
import { ArrowRight, CalendarIcon, ClockIcon } from './icons';
import styles from './TourCard.module.css';

export function TourCard({ tour, priority }: { tour: TourSummary; priority?: boolean }) {
  const lang = useLang();
  const t = useT();
  return (
    <Link href={tourHref(lang, tour.slug)} className={styles.tc} data-testid="tour-card">
      <div className={styles.img}>
        <Image
          src={imageSrc(tour.cardImage, 800, 520)}
          alt={tour.name}
          fill
          sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 380px"
          priority={priority}
        />
        {tour.badge && <span className={styles.badge}>{tour.badge}</span>}
      </div>
      <div className={styles.body}>
        <h4 className={styles.name}>{tour.name}</h4>
        <div className={styles.metas}>
          <span>
            <ClockIcon />
            {tour.duration}
          </span>
          <span>
            <CalendarIcon />
            {tour.schedule}
          </span>
          <span className={styles.rating}>
            <b aria-hidden>★</b> {site.stats.rating}
          </span>
        </div>
        <div className={styles.foot}>
          <div>
            <div className={styles.from}>{t('catalog.from')}</div>
            <div className={styles.price}>
              {formatPrice(tour.priceFrom, lang)}
              <sub>{tour.priceUnit ? ` ${tour.priceUnit}` : t('catalog.perPerson')}</sub>
            </div>
          </div>
          <span className={styles.more}>
            {t('catalog.viewDetails')} <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
