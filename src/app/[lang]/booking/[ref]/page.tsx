import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fill, formatDate, getDict, href, isLocale, PATHS, tourPath } from '@/i18n';
import { formatGBP } from '@/lib/pricing';
import { getContacts, waLink } from '@/lib/server/settings';
import { bookings } from '@/lib/server/store';
import s from '@/components/site/site.module.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false, follow: false } };

type Props = { params: Promise<{ lang: string; ref: string }> };

export default async function BookingConfirmPage({ params }: Props) {
  const { lang, ref } = await params;
  if (!isLocale(lang) || !/^ST-[A-Z0-9]{6}$/.test(ref)) notFound();
  const b = await bookings.get(ref);
  if (!b) notFound();
  const t = getDict(lang);
  const c = await getContacts(lang);
  const [before, after = ''] = fill(t.confirm.thanks, {
    name: b.name.split(' ')[0],
    ref: '\u0000',
  }).split('\u0000');
  const msg = [`${ref}`, b.tourName, `${b.date}${b.time ? ` ${b.time}` : ''}`, b.hotel, `${formatGBP(b.total)}`, b.name].join('\n');

  return (
    <section className={s.section}>
      <div className={s.wrap}>
        <p className={s.ok} style={{ display: 'inline-block' }}>
          ✓
        </p>
        <h1 className={s.h1} style={{ marginTop: 12 }}>
          {t.confirm.title}
        </h1>
        <p className={s.lead}>
          {before}
          <b data-testid="booking-ref">{b.id}</b>
          {after}
        </p>
        <p>{fill(t.confirm.next, { phone: b.phone })}</p>
        {b.requiresDeposit && <p>{t.confirm.deposit}</p>}

        <div className={s.priceTable}>
          <div>
            <span>{b.tourName}</span>
            <Link href={tourPath(lang, b.tourSlug)} className={s.more}>
              →
            </Link>
          </div>
          <div>
            <span>{t.booking.date}</span>
            <b>
              {formatDate(lang, b.date)}
              {b.time && ` · ${b.time}`}
            </b>
          </div>
          <div>
            <span>{t.booking.hotel}</span>
            <b>{b.hotel}</b>
          </div>
          {b.lines.map((l) => (
            <div key={l.key}>
              <span>
                {l.label} × {l.qty}
              </span>
              <b>{formatGBP(l.subtotal)}</b>
            </div>
          ))}
          <div>
            <span>{t.booking.totalOnDay}</span>
            <b>{formatGBP(b.total)}</b>
          </div>
        </div>

        <div className={s.btns}>
          {c.whatsapp && (
            <a href={waLink(c, msg)} target="_blank" rel="noopener noreferrer" className={s.btn}>
              {t.confirm.whatsapp}
            </a>
          )}
          <Link href={href(lang, PATHS.tours)} className={s.btnLine}>
            {t.confirm.more}
          </Link>
        </div>
        <p className={s.hint} style={{ marginTop: 16 }}>
          {t.confirm.change}
        </p>
      </div>
    </section>
  );
}
