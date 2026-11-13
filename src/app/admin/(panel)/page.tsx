import Link from 'next/link';
import { formatGBP } from '@/lib/pricing';
import { BOOKING_STATUSES, bookings, type Booking } from '@/lib/server/store';
import { formatDateTime, formatTourDate } from '../i18n/config';
import { getAdminDict, getAdminLang } from '../i18n/server';
import { StatusBadge } from './StatusBadge';
import styles from '../admin.module.css';

export async function generateMetadata() {
  return { title: (await getAdminDict()).bookings.title };
}

type Search = Promise<{ status?: string; q?: string; when?: string }>;

function guests(b: Booking) {
  return b.lines.map((l) => `${l.qty}× ${l.label}`).join(', ');
}

export default async function AdminBookingsPage({ searchParams }: { searchParams: Search }) {
  const { status = 'all', q = '', when = 'upcoming' } = await searchParams;
  const [lang, t] = await Promise.all([getAdminLang(), getAdminDict()]);
  const all = (await bookings.list()).slice().reverse();
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();

  const stats = {
    pending: all.filter((b) => b.status === 'pending').length,
    week: all.filter((b) => b.createdAt >= weekAgo).length,
    upcoming: all.filter((b) => b.status === 'confirmed' && b.date >= today).length,
    revenue: all.filter((b) => b.status === 'confirmed' && b.date >= today).reduce((s, b) => s + b.total, 0),
  };

  const needle = q.trim().toLowerCase();
  const rows = all
    .filter((b) => status === 'all' || b.status === status)
    .filter((b) => when === 'all' || (when === 'upcoming' ? b.date >= today : b.date < today))
    .filter(
      (b) =>
        !needle ||
        [b.id, b.name, b.phone, b.email, b.hotel, b.tourName].some((v) => v.toLowerCase().includes(needle)),
    );

  return (
    <>
      <h1 className={styles.h1}>{t.bookings.title}</h1>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <b>{stats.pending}</b>
          <span>{t.bookings.statPending}</span>
        </div>
        <div className={styles.stat}>
          <b>{stats.week}</b>
          <span>{t.bookings.statWeek}</span>
        </div>
        <div className={styles.stat}>
          <b>{stats.upcoming}</b>
          <span>{t.bookings.statUpcoming}</span>
        </div>
        <div className={styles.stat}>
          <b>{formatGBP(stats.revenue)}</b>
          <span>{t.bookings.statRevenue}</span>
        </div>
      </div>

      <form className={styles.filters} role="search">
        <input name="q" defaultValue={q} placeholder={t.bookings.searchPh} aria-label={t.bookings.searchAria} />
        <select name="status" defaultValue={status} aria-label={t.bookings.statusAria}>
          <option value="all">{t.bookings.allStatuses}</option>
          {BOOKING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {t.status[s]}
            </option>
          ))}
        </select>
        <select name="when" defaultValue={when} aria-label={t.bookings.dateAria}>
          <option value="upcoming">{t.bookings.upcoming}</option>
          <option value="past">{t.bookings.past}</option>
          <option value="all">{t.bookings.allDates}</option>
        </select>
        <button type="submit" className={styles.btnPrimary}>
          {t.common.search}
        </button>
      </form>

      {rows.length === 0 ? (
        <p className={styles.empty}>{t.bookings.none}</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t.bookings.colRef}</th>
                <th>{t.bookings.colDate}</th>
                <th>{t.bookings.colTour}</th>
                <th>{t.bookings.colClient}</th>
                <th>{t.bookings.colGuests}</th>
                <th>{t.bookings.colTotal}</th>
                <th>{t.bookings.colStatus}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id}>
                  <td>
                    <Link href={`/admin/bookings/${b.id}/`} className={styles.ref}>
                      {b.id}
                    </Link>
                    <small>{formatDateTime(lang, b.createdAt, 'short')}</small>
                  </td>
                  <td>
                    {formatTourDate(lang, b.date)}
                    {b.time && <small>{b.time}</small>}
                  </td>
                  <td>
                    {b.tourName}
                    <small>{b.hotel}</small>
                  </td>
                  <td>
                    {b.name}
                    <small>{b.phone}</small>
                  </td>
                  <td>{guests(b)}</td>
                  <td>{formatGBP(b.total)}</td>
                  <td>
                    <StatusBadge status={b.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
