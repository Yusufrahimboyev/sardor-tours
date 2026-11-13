import { messages } from '@/lib/server/store';
import { setMessageRead } from '../../actions';
import { formatDateTime } from '../../i18n/config';
import { getAdminDict, getAdminLang } from '../../i18n/server';
import styles from '../../admin.module.css';

export async function generateMetadata() {
  return { title: (await getAdminDict()).messages.title };
}

export default async function AdminMessagesPage() {
  const items = (await messages.list()).slice().reverse();
  const [lang, t] = await Promise.all([getAdminLang(), getAdminDict()]);
  return (
    <>
      <h1 className={styles.h1}>{t.messages.title}</h1>
      {items.length === 0 ? (
        <p className={styles.empty}>{t.messages.none}</p>
      ) : (
        <div className={styles.msgList}>
          {items.map((m) => (
            <article key={m.id} className={`${styles.card} ${m.read ? styles.read : ''}`}>
              <header className={styles.msgHead}>
                <div>
                  <b>{m.name}</b> · <span className={styles.topic}>{t.messages.topics[m.topic] ?? m.topic}</span>
                  <small>{formatDateTime(lang, m.createdAt)}</small>
                </div>
                <form action={setMessageRead.bind(null, m.id, !m.read)}>
                  <button type="submit" className={styles.btnGhost}>
                    {m.read ? t.messages.markUnread : t.messages.markRead}
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
