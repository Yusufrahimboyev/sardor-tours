import { reviews } from '@/lib/server/store';
import { deleteReviewAction, toggleReviewAction } from '../../contentActions';
import { DeleteButton } from '../DeleteButton';
import { AddReviewForm } from './AddReviewForm';
import { getAdminDict } from '../../i18n/server';
import styles from '../../admin.module.css';

export async function generateMetadata() {
  return { title: (await getAdminDict()).reviews.title };
}

export default async function AdminReviewsPage() {
  const items = (await reviews.list()).slice().reverse();
  const t = await getAdminDict();
  const LANG: Record<string, string> = { all: t.reviews.allLangs, en: 'EN', ru: 'RU', uz: 'UZ' };
  return (
    <>
      <h1 className={styles.h1}>{t.reviews.title}</h1>
      <p className={styles.muted}>{t.reviews.intro}</p>
      <AddReviewForm />
      {items.length === 0 ? (
        <p className={styles.empty}>{t.reviews.none}</p>
      ) : (
        <div className={styles.msgList} style={{ marginTop: 16 }}>
          {items.map((r) => (
            <article key={r.id} className={`${styles.card} ${r.active ? '' : styles.read}`}>
              <header className={styles.msgHead}>
                <div>
                  <b>{r.name}</b> · <span style={{ color: '#f5a524' }}>{'★'.repeat(r.rating)}</span> · <span className={styles.topic}>{LANG[r.lang]}</span>
                  <small>
                    {r.meta && `${r.meta} · `}
                    {r.active ? t.common.visibleOnSite : t.common.hidden}
                  </small>
                </div>
                <div className={styles.actions}>
                  <form action={toggleReviewAction.bind(null, r.id, !r.active)}>
                    <button type="submit" className={styles.btnGhost}>
                      {r.active ? t.common.hide : t.common.show}
                    </button>
                  </form>
                  <DeleteButton action={deleteReviewAction.bind(null, r.id)} confirmText={t.reviews.deleteConfirm} />
                </div>
              </header>
              <p className={styles.pre}>{r.text}</p>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
