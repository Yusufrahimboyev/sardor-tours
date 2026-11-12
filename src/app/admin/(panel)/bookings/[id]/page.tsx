import { Fragment } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { whatsappLink } from '@/data/site';
import { tourHref } from '@/data/tours';
import { formatLongDate } from '@/lib/dates';
import { formatGBP } from '@/lib/pricing';
import { bookings, type Booking } from '@/lib/server/store';
import { saveBookingNote, setBookingStatus } from '../../../actions';
import { StatusBadge } from '../../StatusBadge';
import styles from '../../../admin.module.css';

export const metadata = { title: 'Bron' };

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

  return (
    <>
      <Link href="/admin/" className={styles.back}>
        ← Barcha bronlar
      </Link>
      <div className={styles.detailHead}>
        <h1 className={styles.h1}>
          {b.id} <StatusBadge status={b.status} />
        </h1>
        <div className={styles.actions}>
          {b.status !== 'confirmed' && (
            <form action={setBookingStatus.bind(null, b.id, 'confirmed')}>
              <button type="submit" className={styles.btnGreen}>
                ✓ Tasdiqlash
              </button>
            </form>
          )}
          {b.status !== 'cancelled' && (
            <form action={setBookingStatus.bind(null, b.id, 'cancelled')}>
              <button type="submit" className={styles.btnRed}>
                Bekor qilish
              </button>
            </form>
          )}
          {b.status !== 'pending' && (
            <form action={setBookingStatus.bind(null, b.id, 'pending')}>
              <button type="submit" className={styles.btnGhost}>
                Kutilmoqda holatiga qaytarish
              </button>
            </form>
          )}
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className={styles.btnWa}>
              Mijozga WhatsApp yozish
            </a>
          )}
        </div>
      </div>

      <div className={styles.grid2}>
        <section className={styles.card}>
          <h2>Tur</h2>
          <dl className={styles.dl}>
            <dt>Tur</dt>
            <dd>
              <Link href={tourHref(b.tourSlug)} target="_blank">
                {b.tourName} ↗
              </Link>
            </dd>
            <dt>Sana</dt>
            <dd>
              {formatLongDate(b.date)}
              {b.time && ` · ${b.time}`}
            </dd>
            <dt>Mehmonxona</dt>
            <dd>{b.hotel}</dd>
            {b.lines.map((l) => (
              <Fragment key={l.key}>
                <dt>
                  {l.label} × {l.qty}
                </dt>
                <dd>{formatGBP(l.subtotal)}</dd>
              </Fragment>
            ))}
            <dt>Jami (tur kuni to‘lanadi)</dt>
            <dd className={styles.total}>{formatGBP(b.total)}</dd>
            {b.requiresDeposit && (
              <>
                <dt>Depozit</dt>
                <dd>Kerak — to‘lov ma’lumotini yuboring</dd>
              </>
            )}
          </dl>
        </section>

        <section className={styles.card}>
          <h2>Mijoz</h2>
          <dl className={styles.dl}>
            <dt>Ism</dt>
            <dd>{b.name}</dd>
            <dt>Telefon / WhatsApp</dt>
            <dd>
              <a href={`tel:${b.phone.replace(/[^\d+]/g, '')}`}>{b.phone}</a>
            </dd>
            {b.email && (
              <>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${b.email}`}>{b.email}</a>
                </dd>
              </>
            )}
            {b.notes && (
              <>
                <dt>Mijoz izohi</dt>
                <dd className={styles.pre}>{b.notes}</dd>
              </>
            )}
            <dt>Qabul qilindi</dt>
            <dd>{new Date(b.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</dd>
            {b.updatedAt && (
              <>
                <dt>Oxirgi o‘zgarish</dt>
                <dd>{new Date(b.updatedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</dd>
              </>
            )}
          </dl>

          <form action={saveBookingNote.bind(null, b.id)} className={styles.noteForm}>
            <label htmlFor="note">Ichki izoh (faqat adminlar ko‘radi)</label>
            <textarea id="note" name="note" rows={3} defaultValue={b.adminNote ?? ''} placeholder="Haydovchi, olib ketish vaqti, to‘lov…" />
            <button type="submit" className={styles.btnPrimary}>
              Izohni saqlash
            </button>
          </form>
        </section>
      </div>
    </>
  );
}
