import { reviews } from '@/data/reviews';
import { site } from '@/data/site';
import type { Locale } from '@/i18n/config';
import { getT } from '@/i18n/messages';
import styles from './tour.module.css';

const FACES = [
  'linear-gradient(135deg,#ff8a3d,#e85d04)',
  'linear-gradient(135deg,#38bdf8,#0369a1)',
  'linear-gradient(135deg,#f472b6,#be185d)',
  'linear-gradient(135deg,#34d399,#047857)',
  'linear-gradient(135deg,#a78bfa,#6d28d9)',
];

/** Compact horizontal strip of short reviews near the top of a tour page. */
export function TravellerReviews({ lang }: { lang: Locale }) {
  if (!reviews.length) return null;
  const t = getT(lang);
  return (
    <div className={styles.trv}>
      <div className={styles.trvHead}>
        <div>
          <div className={styles.trvEyebrow}>{t('reviews.travellerReviews')}</div>
          <div className={styles.trvScore}>
            <span aria-hidden>★★★★★</span>
            <b>{site.stats.rating}</b>
          </div>
        </div>
        <div className={styles.trvAvs} aria-hidden>
          {reviews.slice(0, 5).map((r, i) => (
            <span key={`${r.name}-${r.date}`} style={{ background: FACES[i % FACES.length] }}>
              {r.name.charAt(0)}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.trvTrack}>
        {reviews.map((r) => (
          <figure key={`${r.name}-${r.date}`} className={styles.trvCard}>
            <div className={styles.trvStars} aria-label={t('client.reviews.starsAria', { n: r.rating })}>
              {'★'.repeat(r.rating)}
            </div>
            <blockquote>{r.text}</blockquote>
            <figcaption>{r.name}</figcaption>
          </figure>
        ))}
      </div>
      <div className={styles.trvMore}>
        <a href="#reviews">{t('reviews.readAll')}</a>
      </div>
    </div>
  );
}
