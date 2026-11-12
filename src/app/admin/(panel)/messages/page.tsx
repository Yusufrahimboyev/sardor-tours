import { messages } from '@/lib/server/store';
import { setMessageRead } from '../../actions';
import styles from '../../admin.module.css';

export const metadata = { title: 'Xabarlar' };

const TOPICS: Record<string, string> = {
  booking: 'Bron bo‘yicha savol',
  private: 'Shaxsiy tur',
  group: 'Guruh broni',
  other: 'Boshqa',
};

export default async function AdminMessagesPage() {
  const items = (await messages.list()).slice().reverse();
  return (
    <>
      <h1 className={styles.h1}>Xabarlar</h1>
      {items.length === 0 ? (
        <p className={styles.empty}>Hozircha xabar yo‘q.</p>
      ) : (
        <div className={styles.msgList}>
          {items.map((m) => (
            <article key={m.id} className={`${styles.card} ${m.read ? styles.read : ''}`}>
              <header className={styles.msgHead}>
                <div>
                  <b>{m.name}</b> · <span className={styles.topic}>{TOPICS[m.topic] ?? m.topic}</span>
                  <small>{new Date(m.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</small>
                </div>
                <form action={setMessageRead.bind(null, m.id, !m.read)}>
                  <button type="submit" className={styles.btnGhost}>
                    {m.read ? 'O‘qilmagan deb belgilash' : 'O‘qildi'}
                  </button>
                </form>
              </header>
              <p className={styles.pre}>{m.message}</p>
              <div className={styles.msgContact}>
                <a href={`mailto:${m.email}`}>{m.email}</a>
                {m.phone && <a href={`tel:${m.phone.replace(/[^\d+]/g, '')}`}>{m.phone}</a>}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
