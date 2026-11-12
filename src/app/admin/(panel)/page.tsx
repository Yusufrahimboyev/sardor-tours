import Link from 'next/link';
import { formatLongDate } from '@/lib/dates';
import { formatGBP } from '@/lib/pricing';
import { BOOKING_STATUSES, bookings, type Booking } from '@/lib/server/store';
import { STATUS_UZ, StatusBadge } from './StatusBadge';
import styles from '../admin.module.css';

export const metadata = { title: 'Bronlar' };

type Search = Promise<{ status?: string; q?: string; when?: string }>;

function guests(b: Booking) {
  return b.lines.map((l) => `${l.qty}× ${l.label}`).join(', ');
}

export default async function AdminBookingsPage({ searchParams }: { searchParams: Search }) {
  const { status = 'all', q = '', when = 'upcoming' } = await searchParams;
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
      <h1 className={styles.h1}>Bronlar</h1>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <b>{stats.pending}</b>
          <span>Tasdiq kutmoqda</span>
        </div>
        <div className={styles.stat}>
          <b>{stats.week}</b>
          <span>So‘nggi 7 kunda yangi</span>
        </div>
        <div className={styles.stat}>
          <b>{stats.upcoming}</b>
          <span>Tasdiqlangan, oldinda</span>
        </div>
        <div className={styles.stat}>
          <b>{formatGBP(stats.revenue)}</b>
          <span>Oldindagi tasdiqlangan summa</span>
        </div>
      </div>

      <form className={styles.filters} role="search">
        <input name="q" defaultValue={q} placeholder="Ism, telefon, mehmonxona yoki bron raqami…" aria-label="Bronlarni qidirish" />
        <select name="status" defaultValue={status} aria-label="Holat">
          <option value="all">Barcha holatlar</option>
          {BOOKING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_UZ[s]}
            </option>
          ))}
        </select>
        <select name="when" defaultValue={when} aria-label="Tur sanasi">
          <option value="upcoming">Oldindagi turlar</option>
          <option value="past">O‘tgan turlar</option>
          <option value="all">Barcha sanalar</option>
        </select>
        <button type="submit" className={styles.btnPrimary}>
          Qidirish
        </button>
      </form>

      {rows.length === 0 ? (
        <p className={styles.empty}>Bunday bron topilmadi.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Bron raqami</th>
                <th>Tur sanasi</th>
                <th>Tur</th>
                <th>Mijoz</th>
                <th>Mehmonlar</th>
                <th>Summa</th>
                <th>Holat</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id}>
                  <td>
                    <Link href={`/admin/bookings/${b.id}/`} className={styles.ref}>
                      {b.id}
                    </Link>
                    <small>{new Date(b.createdAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}</small>
                  </td>
                  <td>
                    {formatLongDate(b.date)}
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
