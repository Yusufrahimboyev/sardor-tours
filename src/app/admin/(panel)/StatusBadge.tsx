import type { BookingStatus } from '@/lib/server/store';
import styles from '../admin.module.css';

export const STATUS_UZ: Record<BookingStatus, string> = {
  pending: 'Kutilmoqda',
  confirmed: 'Tasdiqlangan',
  cancelled: 'Bekor qilingan',
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return <span className={`${styles.badge} ${styles[`st_${status}`]}`}>{STATUS_UZ[status]}</span>;
}
