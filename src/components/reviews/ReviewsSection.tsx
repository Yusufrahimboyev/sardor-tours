import { reviews } from '@/data/reviews';
import { site } from '@/data/site';
import { ReviewsCarousel } from './ReviewsCarousel';
import styles from './ReviewsSection.module.css';

const TRUST_LINE = [
  <>
    Trusted by <b>{site.stats.travellers}</b> Travellers
  </>,
  `Highly Rated on ${site.reviewPlatforms.join(', ').replace(/, ([^,]*)$/, ' & $1')}`,
  <>
    <b>{site.stats.rating}/5</b> average rating
  </>,
  'No prepayment · Free hotel transfer',
];

/** "Reviews — What they say": heading, trust marquee, overall score and the review carousel. */
export function ReviewsSection({ id = 'reviews', className }: { id?: string; className?: string }) {
  return (
    <section id={id} className={`${styles.rvSec} ${className ?? ''}`} aria-labelledby={`${id}-h`}>
      <span className={styles.bmEyebrow}>Reviews</span>
      <div className={styles.bmHeadRow}>
        <h2 id={`${id}-h`} className={styles.bmH}>
          What they <span>say</span>
        </h2>
        <div className={styles.ghostText} aria-hidden>
          +{site.stats.travellersShort}
        </div>
      </div>
      <div className={styles.marquee} aria-hidden>
        <div className={styles.marqueeTrack}>
          {[0, 1].map((k) => (
            <div key={k} className={styles.marqueeGroup}>
              {TRUST_LINE.map((t, i) => (
                <span key={i} className={styles.marqueeItem}>
                  {t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.rvScore}>
        <div className={styles.rvScoreTag}>Excellent</div>
        <div className={styles.rvStars} role="img" aria-label={`Rated ${site.stats.rating} out of 5`}>
          <span>★★★★★</span>
          <span className={styles.rvStarsFill} style={{ width: `${(Number(site.stats.rating) / 5) * 100}%` }}>
            ★★★★★
          </span>
        </div>
        <div className={styles.rvScoreSub}>
          Based on <b>{site.stats.reviews} reviews</b>
        </div>
      </div>
      <ReviewsCarousel items={reviews} />
    </section>
  );
}
