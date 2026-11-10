import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Footer } from '@/components/Footer';
import { CheckIcon, WhatsAppIcon } from '@/components/icons';
import { SiteHeader } from '@/components/SiteHeader';
import { whatsappLink } from '@/data/site';
import { tourHref } from '@/data/categories';
import { getTour } from '@/data/tours';
import type { Locale } from '@/i18n/config';
import { formatDate, formatPrice } from '@/i18n/format';
import { getT } from '@/i18n/messages';
import type { T } from '@/i18n/translate';
import { langFrom } from '@/i18n/params';
import { localeHref } from '@/i18n/routing';
import { bookings, type Booking } from '@/lib/server/store';
import styles from './booking.module.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = await langFrom(params);
  return { title: getT(lang)('booking.confirm.metaTitle'), robots: { index: false, follow: false } };
}

function whatsappBookingMessage(b: Booking, lang: Locale, t: T): string {
  const tour = getTour(b.tourSlug, lang);
  const labels = new Map((tour?.options ?? []).map((o) => [o.key, o.label]));
  const lines = [
    t('client.whatsapp.bookingIntro', { ref: b.id }),
    '',
    // The English name in brackets lets the team recognise the tour whatever the customer's language.
    t('client.whatsapp.bookingTour', { name: tour?.name ?? b.tourName, en: b.tourName }),
    b.time
      ? t('client.whatsapp.bookingDateTime', { date: formatDate(b.date, lang), time: b.time })
      : t('client.whatsapp.bookingDate', { date: formatDate(b.date, lang) }),
    t('client.whatsapp.bookingHotel', { hotel: b.hotel }),
    ...b.lines.map((l) =>
      t('client.whatsapp.bookingLine', {
        label: labels.get(l.key) ?? l.label,
        qty: l.qty,
        unit: formatPrice(l.unitPrice, lang),
        subtotal: formatPrice(l.subtotal, lang),
      }),
    ),
    t('client.whatsapp.bookingTotal', { total: formatPrice(b.total, lang) }),
    t('client.whatsapp.bookingName', { name: b.name }),
    '',
    t('client.whatsapp.bookingConfirm'),
  ];
  return lines.join('\n');
}

export default async function BookingPage({ params }: { params: Promise<{ lang: string; ref: string }> }) {
  const lang = await langFrom(params);
  const { ref } = await params;
  if (!/^ST-[A-Z0-9]{6}$/.test(ref)) notFound();
  const b = await bookings.get(ref);
  if (!b) notFound();

  const t = getT(lang);
  const tour = getTour(b.tourSlug, lang);
  const tourName = tour?.name ?? b.tourName;
  const labels = new Map((tour?.options ?? []).map((o) => [o.key, o.label]));
  const lineLabel = (l: Booking['lines'][number]) => labels.get(l.key) ?? l.label;

  return (
    <div className={styles.page}>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className={styles.main}>
        <div className={styles.card}>
          <span className={styles.ic}>
            <CheckIcon size={30} />
          </span>
          <h1>{t('booking.confirm.title')}</h1>
          <p className={styles.lead}>
            {t('booking.confirm.thanks', { name: b.name.split(' ')[0] })} <b data-testid="booking-ref">{b.id}</b>.{' '}
            {t(b.requiresDeposit ? 'booking.confirm.leadDeposit' : 'booking.confirm.lead', { phone: b.phone })}
          </p>

          <dl className={styles.details}>
            <div>
              <dt>{t('booking.confirm.tour')}</dt>
              <dd>
                <Link href={tourHref(lang, b.tourSlug)}>{tourName}</Link>
              </dd>
            </div>
            <div>
              <dt>{t('booking.confirm.date')}</dt>
              <dd>
                {formatDate(b.date, lang)}
                {b.time ? ` · ${b.time}` : ''}
              </dd>
            </div>
            <div>
              <dt>{t('booking.confirm.hotel')}</dt>
              <dd>{b.hotel}</dd>
            </div>
            {b.lines.map((l) => (
              <div key={l.key}>
                <dt>
                  {lineLabel(l)} × {l.qty}
                </dt>
                <dd>{formatPrice(l.subtotal, lang)}</dd>
              </div>
            ))}
            <div className={styles.total}>
              <dt>{t('booking.confirm.totalPayDay')}</dt>
              <dd>{formatPrice(b.total, lang)}</dd>
            </div>
          </dl>

          <div className={styles.actions}>
            <a href={whatsappLink(whatsappBookingMessage(b, lang, t))} target="_blank" rel="noopener noreferrer" className="btn-wa">
              <WhatsAppIcon /> {t('booking.confirm.whatsappCta')}
            </a>
            <Link href={localeHref(lang, '/sharm/')} className={styles.secondary}>
              {t('booking.confirm.browse')}
            </Link>
          </div>
          <p className={styles.small}>
            {t('booking.confirm.changeNote')}{' '}
            <Link href={localeHref(lang, '/terms-and-conditions/')}>{t('booking.confirm.terms')}</Link>.
          </p>
        </div>
      </main>
      <Footer lang={lang} tone="light" />
    </div>
  );
}
