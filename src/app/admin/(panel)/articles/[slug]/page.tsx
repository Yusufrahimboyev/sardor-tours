import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticle } from '@/lib/server/articles';
import { listTours } from '@/lib/server/tours';
import { deleteArticleAction } from '../../../contentActions';
import { DeleteButton } from '../../DeleteButton';
import { ArticleEditor } from './ArticleEditor';
import { getAdminDict } from '../../../i18n/server';
import styles from '../../../admin.module.css';

export async function generateMetadata() {
  return { title: (await getAdminDict()).articles.editTitle };
}

export default async function AdminArticleEditPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { slug } = await params;
  const a = await getArticle(slug, { all: true });
  if (!a) notFound();
  const tours = (await listTours({ all: true })).map((t) => ({ slug: t.slug, name: t.name }));
  const { saved } = await searchParams;
  const t = await getAdminDict();
  return (
    <>
      <Link href="/admin/articles/" className={styles.back}>
        {t.articles.back}
      </Link>
      <div className={styles.detailHead}>
        <h1 className={styles.h1}>{a.i18n.en?.title || a.i18n.ru?.title || a.i18n.uz?.title || t.articles.newArticle}</h1>
        <DeleteButton action={deleteArticleAction.bind(null, a.slug)} confirmText={t.articles.deleteConfirm} />
      </div>
      <ArticleEditor key={a.slug} article={a} tours={tours} justSaved={saved === '1'} />
    </>
  );
}
