import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/data/site';
import { requireAdmin } from '@/lib/server/auth';
import { bookings, messages } from '@/lib/server/store';
import { logout } from '../actions';
import styles from '../admin.module.css';

export const metadata: Metadata = {
  title: { default: 'Admin', template: `%s · Admin | ${site.name}` },
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const [b, m] = await Promise.all([bookings.list(), messages.list()]);
  const pending = b.filter((x) => x.status === 'pending').length;
  const unread = m.filter((x) => !x.read).length;

  return (
    <div className={styles.shell}>
      <header className={styles.top}>
        <Link href="/admin/" className={styles.brand}>
          {site.name} <span>Admin</span>
        </Link>
        <nav className={styles.nav} aria-label="Admin">
          <Link href="/admin/">
            Bronlar {pending > 0 && <b className={styles.count}>{pending}</b>}
          </Link>
          <Link href="/admin/tours/">Turlar</Link>
          <Link href="/admin/articles/">Maqolalar</Link>
          <Link href="/admin/reviews/">Sharhlar</Link>
          <Link href="/admin/messages/">
            Xabarlar {unread > 0 && <b className={styles.count}>{unread}</b>}
          </Link>
          <Link href="/admin/settings/">Sozlamalar</Link>
          <Link href="/" target="_blank">
            Saytni ochish ↗
          </Link>
        </nav>
        <form action={logout}>
          <button type="submit" className={styles.btnGhost}>
            Chiqish
          </button>
        </form>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
