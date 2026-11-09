import type { Metadata } from 'next';
import { Footer } from '@/components/Footer';
import { MailIcon, WhatsAppIcon } from '@/components/icons';
import { SiteHeader } from '@/components/SiteHeader';
import { site, whatsappLink } from '@/data/site';
import { langFrom } from '@/i18n/params';
import { localeHref } from '@/i18n/routing';
import styles from '../legal.module.css';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = await langFrom(params);
  return {
    title: 'Terms & Conditions',
    description: 'Booking, payment, cancellation and refund terms for Sardor Tours excursions in Egypt.',
    alternates: { canonical: localeHref(lang, '/terms-and-conditions/') },
  };
}

const PREPAID = ['Large group bookings', 'Cairo trips', 'Luxor by Plane', 'Petra — Jordan', 'VIP Boat to White Island', 'Private tours'];

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await langFrom(params);
  return (
    <div className={styles.page}>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className={styles.main}>
        <header className={styles.intro}>
          <h1>Terms &amp; Conditions</h1>
          <p>
            Welcome to {site.name}. These Terms &amp; Conditions apply to all bookings, services and activities provided by{' '}
            {site.name}, a tour operator in Egypt. By confirming a booking, you agree to the
            following terms and policies.
          </p>
          <div className={styles.updated}>Last updated: 1 July 2025</div>
        </header>

        <section className={styles.card} aria-labelledby="t1">
          <h2 id="t1">
            <span className={styles.n}>1</span> Booking &amp; Payments
          </h2>
          <h3>
            <span className={styles.cn}>1.1</span> Booking confirmation
          </h3>
          <p>
            Most of our excursions require no prepayment: reserve your place online or on WhatsApp and pay on the day of your
            activity. We will send your booking confirmation by email or WhatsApp.
          </p>
          <p className={styles.introLine}>The following bookings require a deposit or full payment in advance and are non-refundable (see 2.2):</p>
          <ul className={styles.list}>
            {PREPAID.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p>These reservations are confirmed once your payment has been successfully processed.</p>

          <h3>
            <span className={styles.cn}>1.2</span> Balance payment
          </h3>
          <p>
            Where a deposit has been paid, the remaining balance must be paid in full at least 48 hours before the scheduled
            activity. Failure to complete payment by the deadline may result in your reservation being cancelled.
          </p>

          <h3>
            <span className={styles.cn}>1.3</span> Accepted payment methods
          </h3>
          <div className={styles.pay}>
            <div>
              <div className={styles.payTitle}>Cash</div>
              <div className={styles.cur}>
                <span>€ EUR</span>
                <span>$ USD</span>
                <span>£ GBP</span>
                <span>E£ EGP</span>
              </div>
            </div>
            <div>
              <div className={styles.payTitle}>Card / online</div>
              <div className={styles.fee}>
                +3.5% <span>processing fee</span>
              </div>
              <p className={styles.payD}>Available on request — contact us for details</p>
            </div>
          </div>
          <p className={styles.note}>Note: the 3.5% processing fee is non-refundable and applies to all refunds made via card or online payment.</p>
        </section>

        <section className={styles.card} aria-labelledby="t2">
          <h2 id="t2">
            <span className={styles.n}>2</span> Cancellation &amp; Refund Policy
          </h2>
          <h3>
            <span className={styles.cn}>2.1</span> Standard cancellations
          </h3>
          <p className={styles.introLine}>Except for the non-refundable bookings listed in 2.2:</p>
          <div className={styles.table}>
            <div>
              <span>More than 24 hours before the start of the activity</span>
              <b className={styles.ok}>Full refund of the booking price</b>
            </div>
            <div>
              <span>24 hours or less before the start, or no-show</span>
              <b className={styles.no}>No refund</b>
            </div>
          </div>
          <h3>
            <span className={styles.cn}>2.2</span> Non-refundable bookings
          </h3>
          <p className={styles.introLine}>All bookings that require a deposit or full payment in advance are non-refundable:</p>
          <ul className={styles.list}>
            {PREPAID.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <h3>
            <span className={styles.cn}>2.3</span> Cancellations by {site.name}
          </h3>
          <p>
            We reserve the right to cancel or reschedule activities due to weather or other conditions, or for operational
            reasons. If we cancel, we will offer you a full refund or a new date.
          </p>
        </section>

        <section className={styles.ask} aria-labelledby="ask-h">
          <h2 id="ask-h">Questions about these terms?</h2>
          <p>Our team is available 24/7 on WhatsApp.</p>
          <div className={styles.askBtns}>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className={styles.btn}>
              <WhatsAppIcon size={16} /> {site.phoneDisplay || 'WhatsApp'}
            </a>
            {site.email && (
              <a href={`mailto:${site.email}`} className={`${styles.btn} ${styles.ghost}`}>
                <MailIcon size={16} /> {site.email}
              </a>
            )}
          </div>
        </section>
      </main>
      <Footer lang={lang} tone="light" />
    </div>
  );
}
