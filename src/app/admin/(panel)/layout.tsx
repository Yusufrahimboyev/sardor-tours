import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/data/site';
import { requireAdmin } from '@/lib/server/auth';
import { bookings, messages } from '@/lib/server/store';
import { logout } from '../actions';
import { AdminLangSwitcher } from '../i18n/LangSwitcher';
import { getAdminDict, getAdminLang } from '../i18n/server';
import styles from '../admin.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getAdminDict();
  return {
    title: { default: t.meta.admin, template: `%s · ${t.meta.admin} | ${site.name}` },
    robots: { index: false, follow: false },
  };
}
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const [b, m, lang, t] = await Promise.all([bookings.list(), messages.list(), getAdminLang(), getAdminDict()]);
  const pending = b.filter((x) => x.status === 'pending').length;
  const unread = m.filter((x) => !x.read).length;

  return (
    <div className={styles.shell}>
      <header className={styles.top}>
        <Link href="/admin/" className={styles.brand}>
          {site.name} <span>{t.meta.admin}</span>
        </Link>
        <nav className={styles.nav} aria-label={t.meta.admin}>
          <Link href="/admin/">
            {t.nav.bookings} {pending > 0 && <b className={styles.count}>{pending}</b>}
          </Link>
          <Link href="/admin/tours/">{t.nav.tours}</Link>
          <Link href="/admin/articles/">{t.nav.articles}</Link>
          <Link href="/admin/reviews/">{t.nav.reviews}</Link>
          <Link href="/admin/messages/">
            {t.nav.messages} {unread > 0 && <b className={styles.count}>{unread}</b>}
          </Link>
          <Link href="/admin/settings/">{t.nav.settings}</Link>
          <Link href="/" target="_blank">
            {t.nav.openSite}
          </Link>
        </nav>
        <AdminLangSwitcher lang={lang} label={t.langName} />
        <form action={logout}>
          <button type="submit" className={styles.btnGhost}>
            {t.nav.logout}
          </button>
        </form>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
