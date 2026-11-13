import Link from 'next/link';
import { CATEGORIES, tourHref } from '@/data/categories';
import { imageSrc } from '@/lib/images';
import { listTours } from '@/lib/server/tours';
import { createTourAction, toggleTourActive } from '../../tourActions';
import { getAdminDict } from '../../i18n/server';
import styles from '../../admin.module.css';

export async function generateMetadata() {
  return { title: (await getAdminDict()).tours.title };
}

type Search = Promise<{ q?: string; cat?: string }>;

export default async function AdminToursPage({ searchParams }: { searchParams: Search }) {
  const { q = '', cat = 'all' } = await searchParams;
  const all = await listTours({ all: true });
  const t = await getAdminDict();
  const T = t.tours;
  const catLabel = t.categories;
  const needle = q.trim().toLowerCase();
  const tours = all
    .filter((t) => cat === 'all' || t.category === cat)
    .filter((t) => !needle || t.name.toLowerCase().includes(needle));
  const hidden = all.filter((t) => t.active === false).length;

  return (
    <>
      <div className={styles.detailHead}>
        <div>
          <h1 className={styles.h1}>{T.title}</h1>
          <p className={styles.muted}>{T.summary(all.length, all.length - hidden, hidden)}</p>
        </div>
        <form action={createTourAction}>
          <button type="submit" className={styles.btnBig}>
            {T.create}
          </button>
        </form>
      </div>

      <form className={styles.filters} role="search">
        <input name="q" defaultValue={q} placeholder={T.searchPh} aria-label={T.searchAria} />
        <select name="cat" defaultValue={cat} aria-label={T.catAria}>
          <option value="all">{T.allCats}</option>
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {catLabel[c.key]}
            </option>
          ))}
        </select>
        <button type="submit" className={styles.btnPrimary}>
          {t.common.search}
        </button>
      </form>

      {tours.length === 0 ? (
        <p className={styles.empty}>{T.none}</p>
      ) : (
        <div className={styles.tourGrid}>
          {tours.map((tour) => {
            const hiddenTour = tour.active === false;
            const prices = tour.options.filter((o) => o.group === 'guests');
            return (
              <article key={tour.slug} className={`${styles.tourCard} ${hiddenTour ? styles.tourHidden : ''}`}>
                <Link href={`/admin/tours/${tour.slug}/`} className={styles.tourImg}>
                  {tour.cardImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageSrc(tour.cardImage, 480, 300)} alt="" loading="lazy" />
                  ) : (
                    <span>{t.common.noImage}</span>
                  )}
                  <span className={hiddenTour ? styles.pillHidden : styles.pillLive}>{hiddenTour ? t.common.hidden : t.common.onSite}</span>
                </Link>
                <div className={styles.tourBody}>
                  <Link href={`/admin/tours/${tour.slug}/`} className={styles.tourName}>
                    {tour.name}
                  </Link>
                  <div className={styles.tourMeta}>
                    {catLabel[tour.category]} · {tour.duration || '—'} · {tour.schedule}
                  </div>
                  <div className={styles.tourPrices}>
                    {prices.map((o) => (
                      <span key={o.key}>
                        {o.label}: <b>{o.price ? `£${o.price}` : t.common.free}</b>
                      </span>
                    ))}
                  </div>
                  <div className={styles.tourActions}>
                    <Link href={`/admin/tours/${tour.slug}/`} className={styles.btnPrimary}>
                      {t.common.edit}
                    </Link>
                    <form action={toggleTourActive.bind(null, tour.slug)}>
                      <button type="submit" className={styles.btnGhost}>
                        {hiddenTour ? T.publish : t.common.hide}
                      </button>
                    </form>
                    {!hiddenTour && (
                      <Link href={tourHref(tour.slug)} target="_blank" className={styles.linkSmall}>
                        {t.common.view}
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
