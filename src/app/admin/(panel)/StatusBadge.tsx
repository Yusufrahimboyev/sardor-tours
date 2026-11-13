import type { BookingStatus } from '@/lib/server/store';
import { getAdminDict } from '../i18n/server';
import styles from '../admin.module.css';

export async function StatusBadge({ status }: { status: BookingStatus }) {
  const t = await getAdminDict();
  return <span className={`${styles.badge} ${styles[`st_${status}`]}`}>{t.status[status]}</span>;
}
