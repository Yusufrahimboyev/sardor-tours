import type { Locale } from '@/i18n/config';
import type { Dict } from '@/i18n';
import { reviews } from '@/lib/server/store';
import s from './site.module.css';

/** Approved reviews for this language (added in Admin → Sharhlar). Renders nothing when there are none. */
export async function ReviewList({ locale, t, limit = 6 }: { locale: Locale; t: Dict['home']; limit?: number }) {
  const items = (await reviews.list())
    .filter((r) => r.active && (r.lang === 'all' || r.lang === locale))
    .reverse()
    .slice(0, limit);
  if (!items.length) return null;
  return (
    <section className={s.section} aria-labelledby="reviews-h">
      <div className={s.wrap}>
        <h2 id="reviews-h" className={s.h2}>
          {t.reviewsTitle}
        </h2>
        <div className={s.reviews} style={{ marginTop: 18 }}>
          {items.map((r) => (
            <figure key={r.id} className={s.review}>
              <div className={s.stars} aria-label={`${r.rating}/5`}>
                {'★'.repeat(r.rating)}
              </div>
              <blockquote>{r.text}</blockquote>
              <figcaption>
                <b>{r.name}</b>
                {r.meta && ` · ${r.meta}`}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
