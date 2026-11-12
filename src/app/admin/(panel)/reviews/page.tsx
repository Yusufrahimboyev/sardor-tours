import { reviews } from '@/lib/server/store';
import { deleteReviewAction, toggleReviewAction } from '../../contentActions';
import { DeleteButton } from '../DeleteButton';
import { AddReviewForm } from './AddReviewForm';
import styles from '../../admin.module.css';

export const metadata = { title: 'Sharhlar' };

const LANG: Record<string, string> = { all: 'Barcha tillar', en: 'EN', ru: 'RU', uz: 'UZ' };

export default async function AdminReviewsPage() {
  const items = (await reviews.list()).slice().reverse();
  return (
    <>
      <h1 className={styles.h1}>Sharhlar</h1>
      <p className={styles.muted}>Bosh sahifadagi “Mehmonlarimiz fikri” bloki. Faqat haqiqiy mijozlar sharhlarini qo‘shing.</p>
      <AddReviewForm />
      {items.length === 0 ? (
        <p className={styles.empty}>Hozircha sharh yo‘q. Yuqoridagi forma orqali qo‘shing.</p>
      ) : (
        <div className={styles.msgList} style={{ marginTop: 16 }}>
          {items.map((r) => (
            <article key={r.id} className={`${styles.card} ${r.active ? '' : styles.read}`}>
              <header className={styles.msgHead}>
                <div>
                  <b>{r.name}</b> · <span style={{ color: '#f5a524' }}>{'★'.repeat(r.rating)}</span> · <span className={styles.topic}>{LANG[r.lang]}</span>
                  <small>
                    {r.meta && `${r.meta} · `}
                    {r.active ? 'Saytda ko‘rinadi' : 'Yashirin'}
                  </small>
                </div>
                <div className={styles.actions}>
                  <form action={toggleReviewAction.bind(null, r.id, !r.active)}>
                    <button type="submit" className={styles.btnGhost}>
                      {r.active ? 'Yashirish' : 'Ko‘rsatish'}
                    </button>
                  </form>
                  <DeleteButton action={deleteReviewAction.bind(null, r.id)} confirmText="Sharh o‘chirilsinmi?" />
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
