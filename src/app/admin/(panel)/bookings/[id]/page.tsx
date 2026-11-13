import { Fragment } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { whatsappLink } from '@/data/site';
import { tourHref } from '@/data/tours';
import { formatLongDate } from '@/lib/dates';
import { formatGBP } from '@/lib/pricing';
import { bookings, type Booking } from '@/lib/server/store';
import { saveBookingNote, setBookingStatus } from '../../../actions';
import { formatDateTime, formatTourDate } from '../../../i18n/config';
import { getAdminDict, getAdminLang } from '../../../i18n/server';
import { StatusBadge } from '../../StatusBadge';
import styles from '../../../admin.module.css';

export async function generateMetadata() {
  return { title: (await getAdminDict()).booking.title };
}

/** wa.me link to the *customer* (not the business), with a ready-made confirmation message. */
function customerWhatsApp(b: Booking): string | null {
  const digits = b.phone.replace(/\D/g, '');
  if (digits.length < 7) return null;
  const text = [
    `Hello ${b.name.split(' ')[0]}! This is about your booking ${b.id}.`,
    `${b.tourName} — ${formatLongDate(b.date)}${b.time ? ` at ${b.time}` : ''}.`,
    `Pick-up from: ${b.hotel}.`,
  ].join('\n');
  return whatsappLink(text).replace(/wa\.me\/\d+/, `wa.me/${digits}`);
}

export default async function AdminBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await bookings.get(id);
  if (!b) notFound();
  const wa = customerWhatsApp(b);
  const [lang, t] = await Promise.all([getAdminLang(), getAdminDict()]);
  const T = t.booking;

  return (
    <>
      <Link href="/admin/" className={styles.back}>
        {T.back}
      </Link>
      <div className={styles.detailHead}>
        <h1 className={styles.h1}>
          {b.id} <StatusBadge status={b.status} />
        </h1>
        <div className={styles.actions}>
          {b.status !== 'confirmed' && (
            <form action={setBookingStatus.bind(null, b.id, 'confirmed')}>
              <button type="submit" className={styles.btnGreen}>
                {T.confirm}
              </button>
            </form>
          )}
          {b.status !== 'cancelled' && (
            <form action={setBookingStatus.bind(null, b.id, 'cancelled')}>
              <button type="submit" className={styles.btnRed}>
                {T.cancel}
              </button>
            </form>
          )}
          {b.status !== 'pending' && (
            <form action={setBookingStatus.bind(null, b.id, 'pending')}>
              <button type="submit" className={styles.btnGhost}>
                {T.toPending}
              </button>
            </form>
          )}
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className={styles.btnWa}>
              {T.whatsapp}
            </a>
          )}
        </div>
      </div>

      <div className={styles.grid2}>
        <section className={styles.card}>
          <h2>{T.tourSection}</h2>
          <dl className={styles.dl}>
            <dt>{T.tour}</dt>
            <dd>
              <Link href={tourHref(b.tourSlug)} target="_blank">
                {b.tourName} ↗
              </Link>
            </dd>
            <dt>{T.date}</dt>
            <dd>
              {formatTourDate(lang, b.date)}
              {b.time && ` · ${b.time}`}
            </dd>
            <dt>{T.hotel}</dt>
            <dd>{b.hotel}</dd>
            {b.lines.map((l) => (
              <Fragment key={l.key}>
                <dt>
                  {l.label} × {l.qty}
                </dt>
                <dd>{formatGBP(l.subtotal)}</dd>
              </Fragment>
            ))}
            <dt>{T.total}</dt>
            <dd className={styles.total}>{formatGBP(b.total)}</dd>
            {b.requiresDeposit && (
              <>
                <dt>{T.deposit}</dt>
                <dd>{T.depositText}</dd>
              </>
            )}
          </dl>
        </section>

        <section className={styles.card}>
          <h2>{T.clientSection}</h2>
          <dl className={styles.dl}>
            <dt>{T.name}</dt>
            <dd>{b.name}</dd>
            <dt>{T.phone}</dt>
            <dd>
              <a href={`tel:${b.phone.replace(/[^\d+]/g, '')}`}>{b.phone}</a>
            </dd>
            {b.email && (
              <>
                <dt>{T.email}</dt>
                <dd>
                  <a href={`mailto:${b.email}`}>{b.email}</a>
                </dd>
              </>
            )}
            {b.notes && (
              <>
                <dt>{T.clientNote}</dt>
                <dd className={styles.pre}>{b.notes}</dd>
              </>
            )}
            <dt>{T.received}</dt>
            <dd>{formatDateTime(lang, b.createdAt)}</dd>
            {b.updatedAt && (
              <>
                <dt>{T.updated}</dt>
                <dd>{formatDateTime(lang, b.updatedAt)}</dd>
              </>
            )}
          </dl>

          <form action={saveBookingNote.bind(null, b.id)} className={styles.noteForm}>
            <label htmlFor="note">{T.noteLabel}</label>
            <textarea id="note" name="note" rows={3} defaultValue={b.adminNote ?? ''} placeholder={T.notePh} />
            <button type="submit" className={styles.btnPrimary}>
              {T.noteSave}
            </button>
          </form>
        </section>
      </div>
    </>
  );
}
