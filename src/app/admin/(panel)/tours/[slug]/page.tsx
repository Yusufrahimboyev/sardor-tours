import Link from 'next/link';
import { notFound } from 'next/navigation';
import { tourHref } from '@/data/categories';
import { getTour } from '@/lib/server/tours';
import { deleteTourAction, duplicateTourAction } from '../../../tourActions';
import { DeleteTourButton } from './DeleteTourButton';
import { TourEditor } from './TourEditor';
import { getAdminDict } from '../../../i18n/server';
import styles from '../../../admin.module.css';

export async function generateMetadata() {
  return { title: (await getAdminDict()).tours.editTitle };
}

export default async function AdminTourEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { slug } = await params;
  const tour = await getTour(slug, { all: true });
  if (!tour) notFound();
  const { saved } = await searchParams;
  const t = await getAdminDict();

  return (
    <>
      <Link href="/admin/tours/" className={styles.back}>
        {t.tours.back}
      </Link>
      <div className={styles.detailHead}>
        <h1 className={styles.h1}>{tour.name}</h1>
        <div className={styles.actions}>
          {tour.active !== false && (
            <Link href={tourHref(tour.slug)} target="_blank" className={styles.btnGhost}>
              {t.common.viewOnSite}
            </Link>
          )}
          <form action={duplicateTourAction.bind(null, tour.slug)}>
            <button type="submit" className={styles.btnGhost}>
              {t.tours.duplicate}
            </button>
          </form>
          <DeleteTourButton action={deleteTourAction.bind(null, tour.slug)} name={tour.name} />
        </div>
      </div>
      {/* key: remount the editor with fresh data after the slug changes */}
      <TourEditor key={tour.slug} tour={tour} justSaved={saved === '1'} />
    </>
  );
}
