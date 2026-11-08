import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Footer } from '@/components/Footer';
import { CheckIcon, WhatsAppIcon } from '@/components/icons';
import { SiteHeader } from '@/components/SiteHeader';
import { whatsappLink } from '@/data/site';
import { tourHref } from '@/data/tours';
import { formatLongDate } from '@/lib/dates';
import { formatGBP } from '@/lib/pricing';
import { bookings, type Booking } from '@/lib/server/store';
import styles from './booking.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Booking request received',
  robots: { index: false, follow: false },
};

function whatsappMessage(b: Booking): string {
  const lines = [
    `Hello! I've just sent booking request ${b.id}.`,
    '',
    `Tour: ${b.tourName}`,
    `Date: ${formatLongDate(b.date)}${b.time ? ` at ${b.time}` : ''}`,
    `Hotel: ${b.hotel}`,
    ...b.lines.map((l) => `${l.label}: ${l.qty} × £${l.unitPrice} = £${l.subtotal}`),
    `Total: £${b.total}`,
    `Name: ${b.name}`,
    '',
    'Please confirm availability.',
  ];
  return lines.join('\n');
}

export default async function BookingPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  if (!/^ST-[A-Z0-9]{6}$/.test(ref)) notFound();
  const b = await bookings.get(ref);
  if (!b) notFound();

  return (
    <div className={styles.page}>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className={styles.main}>
        <div className={styles.card}>
          <span className={styles.ic}>
            <CheckIcon size={30} />
          </span>
          <h1>Booking request received</h1>
          <p className={styles.lead}>
            Thank you, {b.name.split(' ')[0]}! Your reference is <b data-testid="booking-ref">{b.id}</b>. Our team will confirm
            availability on WhatsApp ({b.phone}) shortly. No prepayment is needed
            {b.requiresDeposit ? ' — except the deposit required for this experience, which we will send you details for' : ''}.
          </p>

          <dl className={styles.details}>
            <div>
              <dt>Tour</dt>
              <dd>
                <Link href={tourHref(b.tourSlug)}>{b.tourName}</Link>
              </dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd>
                {formatLongDate(b.date)}
                {b.time ? ` · ${b.time}` : ''}
              </dd>
            </div>
            <div>
              <dt>Hotel</dt>
              <dd>{b.hotel}</dd>
            </div>
            {b.lines.map((l) => (
              <div key={l.key}>
                <dt>
                  {l.label} × {l.qty}
                </dt>
                <dd>{formatGBP(l.subtotal)}</dd>
              </div>
            ))}
            <div className={styles.total}>
              <dt>Total — pay on the day</dt>
              <dd>{formatGBP(b.total)}</dd>
            </div>
          </dl>

          <div className={styles.actions}>
            <a href={whatsappLink(whatsappMessage(b))} target="_blank" rel="noopener noreferrer" className="btn-wa">
              <WhatsAppIcon /> Confirm faster on WhatsApp
            </a>
            <Link href="/en/sharm/" className={styles.secondary}>
              Browse more tours
            </Link>
          </div>
          <p className={styles.small}>
            Need to change something? Reply on WhatsApp with your reference. Free cancellation up to 24 hours before the tour —
            see our <Link href="/en/terms-and-conditions/">Terms &amp; Conditions</Link>.
          </p>
        </div>
      </main>
      <Footer tone="light" />
    </div>
  );
}
