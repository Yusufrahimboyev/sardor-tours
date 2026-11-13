import Link from 'next/link';
import { articlePath } from '@/i18n/config';
import { listArticles } from '@/lib/server/articles';
import { createArticleAction, toggleArticleAction } from '../../contentActions';
import { getAdminDict } from '../../i18n/server';
import styles from '../../admin.module.css';

export async function generateMetadata() {
  return { title: (await getAdminDict()).articles.metaTitle };
}

export default async function AdminArticlesPage() {
  const items = await listArticles({ all: true });
  const t = await getAdminDict();
  const A = t.articles;
  return (
    <>
      <div className={styles.detailHead}>
        <div>
          <h1 className={styles.h1}>{A.title}</h1>
          <p className={styles.muted}>{A.intro}</p>
        </div>
        <form action={createArticleAction}>
          <button type="submit" className={styles.btnBig}>
            {A.create}
          </button>
        </form>
      </div>
      {items.length === 0 ? (
        <p className={styles.empty}>{A.none}</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{A.colTitle}</th>
                <th>{A.colLangs}</th>
                <th>{A.colStatus}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((a) => {
                const title = a.i18n.en?.title || a.i18n.ru?.title || a.i18n.uz?.title || A.untitled;
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
                          {a.active ? A.published : A.draft}
                        </button>
                      </form>
                    </td>
                    <td className={styles.rowActions}>
                      <Link href={`/admin/articles/${a.slug}/`}>{t.common.edit}</Link>
                      {a.active && (
                        <Link href={articlePath('en', a.slug)} target="_blank">
                          {t.common.view}
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
