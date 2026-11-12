import Image from 'next/image';
import Link from 'next/link';
import { site } from '@/data/site';
import { tourHref } from '@/data/categories';
import type { TourSummary } from '@/data/tours';
import { imageSrc } from '@/lib/images';
import { ArrowRight, CalendarIcon, ClockIcon } from './icons';
import styles from './TourCard.module.css';

export function TourCard({ tour, priority }: { tour: TourSummary; priority?: boolean }) {
  return (
    <Link href={tourHref(tour.slug)} className={styles.tc} data-testid="tour-card">
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
            <div className={styles.from}>from</div>
            <div className={styles.price}>
              £{tour.priceFrom}
              <sub>{tour.priceUnit ? ` ${tour.priceUnit}` : '/pp'}</sub>
            </div>
          </div>
          <span className={styles.more}>
            View Details <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
