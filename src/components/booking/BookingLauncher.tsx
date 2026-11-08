'use client';

import { useEffect, useState } from 'react';
import type { Tour } from '@/data/tours';
import { Modal } from '@/components/Modal';
import { BookingForm } from './BookingForm';
import styles from './BookingLauncher.module.css';

const OPEN_BOOKING = 'st:open-booking';

/** Any element can open the booking sheet by calling this. */
export function openBooking() {
  window.dispatchEvent(new Event(OPEN_BOOKING));
}

export function BookButton({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <button type="button" className={className} onClick={openBooking}>
      {children}
    </button>
  );
}

/** Sticky mobile booking bar + the booking modal (sheet on mobile, card on desktop). */
export function BookingLauncher({ tour, oldPrice }: { tour: Tour; oldPrice: number | null }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = () => setOpen(true);
    window.addEventListener(OPEN_BOOKING, h);
    return () => window.removeEventListener(OPEN_BOOKING, h);
  }, []);

  return (
    <>
      <div className={styles.bar}>
        <div>
          <div className={styles.from}>No prepayment</div>
          <div className={styles.priceRow}>
            <span className={styles.price}>
              £{tour.priceFrom}
              <small>{tour.priceUnit ? ` ${tour.priceUnit}` : '/pp'}</small>
            </span>
            {oldPrice && <s className={styles.old}>£{oldPrice}</s>}
          </div>
        </div>
        <button type="button" className={styles.book} onClick={() => setOpen(true)}>
          Book
        </button>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} label={`Book: ${tour.name}`} variant="sheet">
        <div className={styles.head}>
          <div className={styles.headTitle}>Book in 3 minutes</div>
          <div className={styles.headSub}>{tour.name}</div>
        </div>
        <div className={styles.body}>
          <BookingForm tour={tour} compact />
        </div>
      </Modal>
    </>
  );
}
