'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Tour, TourOption } from '@/data/tours';
import { fill, weekdayList, type Dict } from '@/i18n';
import type { Locale } from '@/i18n/config';
import { tomorrowISO, weekdayOf } from '@/lib/dates';
import { formatGBP, optionMax, quote, type Quantities } from '@/lib/pricing';
import s from './site.module.css';

interface Values {
  date: string;
  time: string;
  hotel: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  company: string;
}

const phoneRe = /^\+?[0-9 ()-]{7,20}$/;
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** One-screen booking request form in the visitor's language. Posts to /api/bookings/. */
export function BookingForm({ tour, locale, t, c }: { tour: Tour; locale: Locale; t: Dict['booking']; c: Dict['common'] }) {
  const router = useRouter();
  const first = tour.options.find((o) => o.group === 'guests' && o.price > 0);
  const [qty, setQty] = useState<Quantities>(first ? { [first.key]: 1 } : {});
  const [qtyError, setQtyError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    mode: 'onTouched',
    defaultValues: { date: '', time: '', hotel: '', name: '', phone: '', email: '', notes: '', company: '' },
  });
  const time = watch('time');
  const q = quote(tour, qty);
  const guests = tour.options.filter((o) => o.group === 'guests');
  const extras = tour.options.filter((o) => o.group === 'extras');
  const days = tour.scheduleDays ? weekdayList(locale, tour.scheduleDays) : '';

  const validateDate = (v: string) => {
    if (!v) return t.errors.date;
    if (v < tomorrowISO()) return t.errors.dateTomorrow;
    if (tour.scheduleDays && !tour.scheduleDays.includes(weekdayOf(v)!)) return fill(t.errors.dateDays, { days });
    return true;
  };

  const change = (o: TourOption, delta: number) => {
    setQty((prev) => ({ ...prev, [o.key]: Math.min(Math.max(0, (prev[o.key] ?? 0) + delta), optionMax(o)) }));
    setQtyError(null);
  };

  const unitLabel = (o: TourOption) => {
    if (o.free || o.price === 0) return o.unit === 'included' ? c.included : c.free;
    return o.unit === 'person' ? `${formatGBP(o.price)} · ${c.perPerson}` : `${formatGBP(o.price)}${o.unit ? ` / ${o.unit}` : ''}`;
  };

  const onSubmit = async (v: Values) => {
    setFormError(null);
    if (q.guestUnits === 0) {
      setQtyError(t.errors.guests);
      return;
    }
    try {
      const res = await fetch('/api/bookings/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...v, tourSlug: tour.slug, qty }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; reference?: string; fieldErrors?: Record<string, string> };
      if (!res.ok || !data.ok || !data.reference) {
        // Show our own translated messages for the fields the server rejected.
        const fe = data.fieldErrors ?? {};
        const map: Partial<Record<keyof Values, string>> = { date: t.errors.date, time: t.errors.time, hotel: t.errors.hotel, name: t.errors.name, phone: t.errors.phone, email: t.errors.email };
        for (const k of Object.keys(fe)) if (k in map) setError(k as keyof Values, { message: map[k as keyof Values] });
        if (fe.qty) setQtyError(t.errors.guests);
        setFormError(t.failed);
        return;
      }
      router.push(`/${locale}/booking/${data.reference}/`);
    } catch {
      setFormError(t.network);
    }
  };

  const err = (k: keyof Values) => (errors[k] ? <p className={s.err}>{errors[k]?.message}</p> : null);

  return (
    <form className={s.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <input type="text" tabIndex={-1} autoComplete="off" className={s.hp} aria-hidden {...register('company')} />
      <div className={s.row2}>
        <div className={s.field}>
          <label htmlFor="bf-date">{t.date}</label>
          <input id="bf-date" type="date" min={tomorrowISO()} aria-invalid={!!errors.date} {...register('date', { validate: validateDate })} />
          {errors.date ? err('date') : days ? <p className={s.hint}>{fill(t.runsOn, { days })}</p> : null}
        </div>
        <div className={s.field}>
          <label htmlFor="bf-hotel">{t.hotel}</label>
          <input
            id="bf-hotel"
            placeholder={t.hotelPlaceholder}
            autoComplete="off"
            aria-invalid={!!errors.hotel}
            {...register('hotel', { validate: (v) => v.trim().length >= 2 || t.errors.hotel })}
          />
          {err('hotel')}
        </div>
      </div>

      {tour.timeSlots.length > 0 && (
        <fieldset className={s.field} style={{ border: 'none' }}>
          <legend className={s.fieldLabel}>{t.time}</legend>
          <input type="hidden" {...register('time', { validate: (v) => !!v || t.errors.time })} />
          <div className={s.slots}>
            {tour.timeSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                className={time === slot ? s.slotOn : s.slot}
                aria-pressed={time === slot}
                onClick={() => setValue('time', slot, { shouldValidate: true })}
              >
                {slot}
              </button>
            ))}
          </div>
          {err('time')}
        </fieldset>
      )}

      <div className={s.field}>
        <span className={s.fieldLabel}>{t.guests}</span>
        <div className={s.qtyList}>
          {[...guests, ...extras].map((o) => (
            <div key={o.key} className={s.qtyRow}>
              <div>
                <div className={s.qtyLabel}>{o.label}</div>
                <div className={o.price === 0 ? s.freeHint : s.hint}>{unitLabel(o)}</div>
              </div>
              {o.kind === 'toggle' ? (
                <button type="button" className={(qty[o.key] ?? 0) ? s.slotOn : s.slot} aria-pressed={(qty[o.key] ?? 0) > 0} onClick={() => change(o, (qty[o.key] ?? 0) ? -1 : 1)}>
                  {(qty[o.key] ?? 0) ? t.remove : t.add}
                </button>
              ) : (
                <div className={s.counter}>
                  <button type="button" onClick={() => change(o, -1)} disabled={!qty[o.key]} aria-label={`${t.decrease}: ${o.label}`}>
                    −
                  </button>
                  <output aria-live="polite">{qty[o.key] ?? 0}</output>
                  <button type="button" onClick={() => change(o, 1)} disabled={(qty[o.key] ?? 0) >= optionMax(o)} aria-label={`${t.increase}: ${o.label}`}>
                    +
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        {qtyError && (
          <p className={s.err} role="alert">
            {qtyError}
          </p>
        )}
      </div>

      <div className={s.total}>
        <span>{t.totalOnDay}</span>
        <b data-testid="booking-total">{formatGBP(q.total)}</b>
      </div>

      <div className={s.row2}>
        <div className={s.field}>
          <label htmlFor="bf-name">{t.name}</label>
          <input
            id="bf-name"
            autoComplete="name"
            aria-invalid={!!errors.name}
            {...register('name', { validate: (v) => v.trim().length >= 2 || t.errors.name })}
          />
          {err('name')}
        </div>
        <div className={s.field}>
          <label htmlFor="bf-phone">{t.phone}</label>
          <input
            id="bf-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+44 7700 900123"
            aria-invalid={!!errors.phone}
            {...register('phone', { validate: (v) => phoneRe.test(v.trim()) || t.errors.phone })}
          />
          {err('phone')}
        </div>
      </div>
      <div className={s.row2}>
        <div className={s.field}>
          <label htmlFor="bf-email">{t.email}</label>
          <input
            id="bf-email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register('email', { validate: (v) => !v.trim() || emailRe.test(v.trim()) || t.errors.email })}
          />
          {err('email')}
        </div>
        <div className={s.field}>
          <label htmlFor="bf-notes">{t.notes}</label>
          <input id="bf-notes" placeholder={t.notesPlaceholder} {...register('notes')} />
        </div>
      </div>

      {tour.requiresDeposit && <p className={s.hint}>{t.deposit}</p>}
      {formError && (
        <p className={s.err} role="alert">
          {formError}
        </p>
      )}
      <div>
        <button type="submit" className={s.btn} disabled={isSubmitting}>
          {isSubmitting ? t.sending : t.submit}
        </button>
        <p className={s.hint} style={{ marginTop: 8 }}>
          {t.noPrepay}
        </p>
      </div>
    </form>
  );
}
