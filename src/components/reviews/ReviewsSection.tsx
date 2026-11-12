import { reviews } from '@/data/reviews';
import { site } from '@/data/site';
import { INTL_LOCALE, type Locale } from '@/i18n/config';
import { getT } from '@/i18n/messages';
import { ReviewsCarousel } from './ReviewsCarousel';
import styles from './ReviewsSection.module.css';

/** "Reviews — What they say": heading, trust marquee, overall score and the review carousel. */
export function ReviewsSection({ lang, id = 'reviews', className }: { lang: Locale; id?: string; className?: string }) {
  const t = getT(lang);
  const platforms = new Intl.ListFormat(INTL_LOCALE[lang], { type: 'conjunction' }).format(site.reviewPlatforms);
  const trustLine = [
    t('reviews.trusted', { n: site.stats.travellers }),
    t('reviews.ratedOn', { platforms }),
    t('reviews.average', { rating: site.stats.rating }),
    t('reviews.perks'),
  ];
  return (
    <section id={id} className={`${styles.rvSec} ${className ?? ''}`} aria-labelledby={`${id}-h`}>
      <span className={styles.bmEyebrow}>{t('reviews.eyebrow')}</span>
      <div className={styles.bmHeadRow}>
        <h2 id={`${id}-h`} className={styles.bmH}>
          {t('reviews.titleBefore')}
          <span>{t('reviews.titleEm')}</span>
        </h2>
        <div className={styles.ghostText} aria-hidden>
          +{site.stats.travellersShort}
        </div>
      </div>
      <div className={styles.marquee} aria-hidden>
        <div className={styles.marqueeTrack}>
          {[0, 1].map((k) => (
            <div key={k} className={styles.marqueeGroup}>
              {trustLine.map((line) => (
                <span key={line} className={styles.marqueeItem}>
                  {line}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.rvScore}>
        <div className={styles.rvScoreTag}>{t('reviews.excellent')}</div>
        <div className={styles.rvStars} role="img" aria-label={t('reviews.ratedAria', { rating: site.stats.rating })}>
          <span>★★★★★</span>
          <span className={styles.rvStarsFill} style={{ width: `${(Number(site.stats.rating) / 5) * 100}%` }}>
            ★★★★★
          </span>
        </div>
        <div className={styles.rvScoreSub}>{t('reviews.basedOn', { n: site.stats.reviews })}</div>
      </div>
      <ReviewsCarousel items={reviews} />
    </section>
  );
}
