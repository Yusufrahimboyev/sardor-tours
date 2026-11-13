import Link from 'next/link';
import { articlePath } from '@/i18n/config';
import { listArticles } from '@/lib/server/articles';
import { createArticleAction, toggleArticleAction } from '../../contentActions';
import styles from '../../admin.module.css';

export const metadata = { title: 'Maqolalar' };

export default async function AdminArticlesPage() {
  const items = await listArticles({ all: true });
  return (
    <>
      <div className={styles.detailHead}>
        <div>
          <h1 className={styles.h1}>Maqolalar (Ma’lumotnoma)</h1>
          <p className={styles.muted}>Saytdagi “Справочник / Travel guide / Ma’lumotnoma” bo‘limi. Har bir maqola uch tilda bo‘lishi mumkin.</p>
        </div>
        <form action={createArticleAction}>
          <button type="submit" className={styles.btnBig}>
            + Yangi maqola
          </button>
        </form>
      </div>
      {items.length === 0 ? (
        <p className={styles.empty}>Hozircha maqola yo‘q.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Sarlavha</th>
                <th>Tillar</th>
                <th>Holat</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((a) => {
                const title = a.i18n.en?.title || a.i18n.ru?.title || a.i18n.uz?.title || '(sarlavhasiz)';
                return (
                  <tr key={a.id} className={a.active ? undefined : styles.dim}>
                    <td>
                      <Link href={`/admin/articles/${a.slug}/`} className={styles.strong}>
                        {title}
                      </Link>
                      <small>/{a.slug}/</small>
                    </td>
                    <td>
                      {(['en', 'ru', 'uz'] as const).map((l) => (
                        <span key={l} className={`${styles.badge} ${a.i18n[l]?.title ? styles.st_confirmed : styles.st_cancelled}`} style={{ marginRight: 4 }}>
                          {l.toUpperCase()}
                        </span>
                      ))}
                    </td>
                    <td>
                      <form action={toggleArticleAction.bind(null, a.slug)}>
                        <button type="submit" className={styles.btnGhost}>
                          {a.active ? 'Chop etilgan · yashirish' : 'Qoralama · chop etish'}
                        </button>
                      </form>
                    </td>
                    <td className={styles.rowActions}>
                      <Link href={`/admin/articles/${a.slug}/`}>Tahrirlash</Link>
                      {a.active && (
                        <Link href={articlePath('en', a.slug)} target="_blank">
                          Ko‘rish ↗
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
