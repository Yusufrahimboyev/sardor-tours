import Link from 'next/link';
import { CATEGORIES, tourHref } from '@/data/categories';
import { imageSrc } from '@/lib/images';
import { listTours } from '@/lib/server/tours';
import { createTourAction, toggleTourActive } from '../../tourActions';
import styles from '../../admin.module.css';

export const metadata = { title: 'Turlar' };

type Search = Promise<{ q?: string; cat?: string }>;

export default async function AdminToursPage({ searchParams }: { searchParams: Search }) {
  const { q = '', cat = 'all' } = await searchParams;
  const all = await listTours({ all: true });
  const needle = q.trim().toLowerCase();
  const tours = all
    .filter((t) => cat === 'all' || t.category === cat)
    .filter((t) => !needle || t.name.toLowerCase().includes(needle));
  const hidden = all.filter((t) => t.active === false).length;

  return (
    <>
      <div className={styles.detailHead}>
        <div>
          <h1 className={styles.h1}>Turlar</h1>
          <p className={styles.muted}>
            Jami {all.length} ta · saytda {all.length - hidden} ta{hidden ? ` · yashirin ${hidden} ta` : ''}
          </p>
        </div>
        <form action={createTourAction}>
          <button type="submit" className={styles.btnBig}>
            + Yangi tur qo‘shish
          </button>
        </form>
      </div>

      <form className={styles.filters} role="search">
        <input name="q" defaultValue={q} placeholder="Tur nomi bo‘yicha qidirish…" aria-label="Turlarni qidirish" />
        <select name="cat" defaultValue={cat} aria-label="Kategoriya">
          <option value="all">Barcha kategoriyalar</option>
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
        <button type="submit" className={styles.btnPrimary}>
          Qidirish
        </button>
      </form>

      {tours.length === 0 ? (
        <p className={styles.empty}>Hech narsa topilmadi.</p>
      ) : (
        <div className={styles.tourGrid}>
          {tours.map((t) => {
            const hiddenTour = t.active === false;
            const prices = t.options.filter((o) => o.group === 'guests');
            return (
              <article key={t.slug} className={`${styles.tourCard} ${hiddenTour ? styles.tourHidden : ''}`}>
                <Link href={`/admin/tours/${t.slug}/`} className={styles.tourImg}>
                  {t.cardImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageSrc(t.cardImage, 480, 300)} alt="" loading="lazy" />
                  ) : (
                    <span>Rasm yo‘q</span>
                  )}
                  <span className={hiddenTour ? styles.pillHidden : styles.pillLive}>{hiddenTour ? 'Yashirin' : 'Saytda'}</span>
                </Link>
                <div className={styles.tourBody}>
                  <Link href={`/admin/tours/${t.slug}/`} className={styles.tourName}>
                    {t.name}
                  </Link>
                  <div className={styles.tourMeta}>
                    {CATEGORIES.find((c) => c.key === t.category)?.label} · {t.duration || '—'} · {t.schedule}
                  </div>
                  <div className={styles.tourPrices}>
                    {prices.map((o) => (
                      <span key={o.key}>
                        {o.label}: <b>{o.price ? `£${o.price}` : 'bepul'}</b>
                      </span>
                    ))}
                  </div>
                  <div className={styles.tourActions}>
                    <Link href={`/admin/tours/${t.slug}/`} className={styles.btnPrimary}>
                      Tahrirlash
                    </Link>
                    <form action={toggleTourActive.bind(null, t.slug)}>
                      <button type="submit" className={styles.btnGhost}>
                        {hiddenTour ? 'Saytga chiqarish' : 'Yashirish'}
                      </button>
                    </form>
                    {!hiddenTour && (
                      <Link href={tourHref('en', t.slug)} target="_blank" className={styles.linkSmall}>
                        Ko‘rish ↗
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
