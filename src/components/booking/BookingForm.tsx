'use client';

import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Tour } from '@/data/tours';
import { useLang, useT } from '@/i18n/client';
import { localeHref } from '@/i18n/routing';
import { tomorrowISO } from '@/lib/dates';
import { formatDate, formatPrice, weekdayNames } from '@/i18n/format';
import { optionMax, optionPriceLabel, quote, type Quantities } from '@/lib/pricing';
import { bookingIssues, contactDetailsSchema, isErrorKey, type ErrorKey } from '@/lib/validation';
import { useToast } from '@/components/Toast';
import { CheckIcon } from '@/components/icons';
import styles from './BookingForm.module.css';

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

const STEPS = ['date', 'guests', 'details'] as const;

export function BookingForm({ tour, compact }: { tour: Tour; compact?: boolean }) {
  const t = useT();
  const lang = useLang();
  const router = useRouter();
  const err = (key: ErrorKey, params?: { days: number[] }) =>
    t('errors.' + key, params ? { days: weekdayNames(params.days, lang) } : undefined);
  /** zod field validator (messages are error keys) → react-hook-form `validate` function. */
  const zField = <K extends keyof typeof contactDetailsSchema.shape>(key: K) => (v: string) => {
    const r = contactDetailsSchema.shape[key].safeParse(v);
    if (r.success) return true;
    const m = r.error.issues[0].message;
    return isErrorKey(m) ? err(m) : err('generic');
  };
  const toast = useToast();
  const uid = useId();
  const [step, setStep] = useState(0);
  const [qty, setQty] = useState<Quantities>({});
  const [qtyError, setQtyError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<Values>({
    mode: 'onTouched',
    defaultValues: { date: '', time: '', hotel: '', name: '', phone: '', email: '', notes: '', company: '' },
  });

  const date = watch('date');
  const time = watch('time');
  const q = quote(tour, qty);
  const guests = tour.options.filter((o) => o.group === 'guests');
  const extras = tour.options.filter((o) => o.group === 'extras');

  const issueFor = (path: 'date' | 'time') => {
    const issue = bookingIssues(tour, { date: watch('date'), time: watch('time'), qty: { _: 0 } }).find((i) => i.path === path);
    return issue ? err(issue.key, issue.params) : true;
  };

  const change = (key: string, delta: number) => {
    const o = tour.options.find((x) => x.key === key)!;
    setQty((prev) => {
      const n = Math.min(Math.max(0, (prev[key] ?? 0) + delta), optionMax(o));
      return { ...prev, [key]: n };
    });
    setQtyError(null);
  };

  const next = async () => {
    if (step === 0) {
      const ok = await trigger(['date', 'time', 'hotel']);
      if (ok) setStep(1);
    } else if (step === 1) {
      if (q.guestUnits === 0) {
        setQtyError(err('guestsRequired'));
        return;
      }
      setStep(2);
    }
  };

  const onSubmit = async (v: Values) => {
    if (q.guestUnits === 0) {
      setStep(1);
      setQtyError(err('guestsRequired'));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...v, tourSlug: tour.slug, qty, lang }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        reference?: string;
        error?: string;
        fieldErrors?: Record<string, string>;
      };
      if (!res.ok || !data.ok || !data.reference) {
        const fe = data.fieldErrors ?? {};
        for (const [k, m] of Object.entries(fe)) {
          if (k in v) setError(k as keyof Values, { message: m });
        }
        if (fe.date || fe.time || fe.hotel) setStep(0);
        else if (fe.qty) {
          setStep(1);
          setQtyError(fe.qty);
        }
        toast(data.error ?? err('generic'), 'error');
        return;
      }
      toast(t('toast.bookingSent'), 'success');
      router.push(localeHref(lang, '/booking/' + data.reference + '/'));
    } catch {
      toast(err('network'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const fid = (n: string) => `${uid}-${n}`;

  return (
    <form className={`${styles.form} ${compact ? styles.compact : ''}`} onSubmit={handleSubmit(onSubmit)} noValidate>
      <ol className={styles.steps} aria-label={t('booking.stepsAria')}>
        {STEPS.map((s, i) => (
          <li key={s} className={i === step ? styles.stepOn : i < step ? styles.stepDone : ''} aria-current={i === step ? 'step' : undefined}>
            <span>{i < step ? <CheckIcon size={13} /> : i + 1}</span>
            {t('booking.steps.' + s)}
          </li>
        ))}
      </ol>

      {/* honeypot */}
      <input type="text" tabIndex={-1} autoComplete="off" className={styles.hp} aria-hidden {...register('company')} />

      <div hidden={step !== 0} className={styles.pane}>
        <label className={styles.label} htmlFor={fid('date')}>
          {t('booking.selectDate')}
        </label>
        <input
          id={fid('date')}
          type="date"
          min={tomorrowISO()}
          className={`${styles.input} ${errors.date ? styles.invalid : ''}`}
          aria-invalid={!!errors.date}
          aria-describedby={fid('date-hint')}
          {...register('date', { validate: () => issueFor('date') })}
        />
        <p id={fid('date-hint')} className={errors.date ? styles.err : styles.hint}>
          {errors.date?.message ??
            (tour.scheduleDays
              ? t('booking.runsOn', { days: weekdayNames(tour.scheduleDays, lang) })
              : t('booking.schedule', { schedule: tour.schedule }))}
        </p>

        {tour.timeSlots.length > 0 && (
          <fieldset className={styles.fieldset}>
            <legend className={styles.label}>{t('booking.departureTime')}</legend>
            <input type="hidden" {...register('time', { validate: () => issueFor('time') })} />
            <div className={styles.slots}>
              {tour.timeSlots.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`${styles.slot} ${time === t ? styles.slotOn : ''}`}
                  aria-pressed={time === t}
                  onClick={() => setValue('time', t, { shouldValidate: true })}
                >
                  {t}
                </button>
              ))}
            </div>
            {errors.time && <p className={styles.err}>{errors.time.message}</p>}
          </fieldset>
        )}

        <label className={styles.label} htmlFor={fid('hotel')}>
          {t('booking.hotelName')}
        </label>
        <input
          id={fid('hotel')}
          type="text"
          placeholder={t('booking.hotelPlaceholder')}
          autoComplete="off"
          className={`${styles.input} ${errors.hotel ? styles.invalid : ''}`}
          aria-invalid={!!errors.hotel}
          {...register('hotel', {
            validate: (v) => v.trim().length >= 2 || err('hotelRequired'),
          })}
        />
        {errors.hotel && <p className={styles.err}>{errors.hotel.message}</p>}

        <button type="button" className={styles.primary} onClick={next}>
          {t('booking.next')}
        </button>
        <p className={styles.note}>{t('booking.noPrepayNote')}</p>
      </div>

      <div hidden={step !== 1} className={styles.pane}>
        <div className={styles.summary}>
          <div>
            <small>{t('booking.summaryDate')}</small>
            <b>
              {date ? formatDate(date, lang) : '—'}
              {time ? ` · ${time}` : ''}
            </b>
          </div>
          <button type="button" onClick={() => setStep(0)}>
            {t('booking.change')}
          </button>
        </div>
        <div className={styles.label}>{t('booking.guests')}</div>
        {guests.map((o) => (
          <OptionRow key={o.key} label={o.label} sub={optionPriceLabel(o, t, lang)} kind={o.kind} value={qty[o.key] ?? 0} max={optionMax(o)} onChange={(d) => change(o.key, d)} />
        ))}
        {extras.length > 0 && <div className={styles.extras}>{t('booking.extras')}</div>}
        {extras.map((o) => (
          <OptionRow key={o.key} label={o.label} sub={optionPriceLabel(o, t, lang)} kind={o.kind} value={qty[o.key] ?? 0} max={optionMax(o)} onChange={(d) => change(o.key, d)} />
        ))}
        {qtyError && (
          <p className={styles.err} role="alert">
            {qtyError}
          </p>
        )}
        <div className={styles.total}>
          <span>{t('booking.total')}</span>
          <b data-testid="booking-total">{formatPrice(q.total, lang)}</b>
        </div>
        <button type="button" className={styles.primary} onClick={next}>
          {t('booking.next')}
        </button>
        <button type="button" className={styles.back} onClick={() => setStep(0)}>
          {t('booking.back')}
        </button>
      </div>

      <div hidden={step !== 2} className={styles.pane}>
        <label className={styles.label} htmlFor={fid('name')}>
          {t('booking.fullName')}
        </label>
        <input
          id={fid('name')}
          className={`${styles.input} ${errors.name ? styles.invalid : ''}`}
          autoComplete="name"
          aria-invalid={!!errors.name}
          {...register('name', { validate: zField('name') })}
        />
        {errors.name && <p className={styles.err}>{errors.name.message}</p>}

        <label className={styles.label} htmlFor={fid('phone')}>
          {t('booking.phone')}
        </label>
        <input
          id={fid('phone')}
          type="tel"
          placeholder={t('booking.phonePlaceholder')}
          className={`${styles.input} ${errors.phone ? styles.invalid : ''}`}
          autoComplete="tel"
          aria-invalid={!!errors.phone}
          {...register('phone', { validate: zField('phone') })}
        />
        {errors.phone && <p className={styles.err}>{errors.phone.message}</p>}

        <label className={styles.label} htmlFor={fid('email')}>
          {t('booking.email')} <span className={styles.opt}>{t('booking.optional')}</span>
        </label>
        <input
          id={fid('email')}
          type="email"
          className={`${styles.input} ${errors.email ? styles.invalid : ''}`}
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register('email', { validate: zField('email') })}
        />
        {errors.email && <p className={styles.err}>{errors.email.message}</p>}

        <label className={styles.label} htmlFor={fid('notes')}>
          {t('booking.notes')} <span className={styles.opt}>{t('booking.optional')}</span>
        </label>
        <textarea id={fid('notes')} rows={2} className={styles.input} placeholder={t('booking.notesPlaceholder')} {...register('notes')} />

        <div className={styles.lines}>
          {q.lines.map((l) => (
            <div key={l.key}>
              <span>
                {l.label} × {l.qty}
              </span>
              <span>{formatPrice(l.subtotal, lang)}</span>
            </div>
          ))}
          <div className={styles.total}>
            <span>{t('booking.totalPayDay')}</span>
            <b>{formatPrice(q.total, lang)}</b>
          </div>
        </div>
        {tour.requiresDeposit && (
          <p className={styles.deposit}>{t('booking.deposit')}</p>
        )}
        <button type="submit" className={styles.primary} disabled={submitting} aria-busy={submitting}>
          {submitting ? t('booking.sending') : t('booking.submit')}
        </button>
        <button type="button" className={styles.back} onClick={() => setStep(1)}>
          {t('booking.back')}
        </button>
      </div>
    </form>
  );
}

function OptionRow(props: {
  label: string;
  sub: string;
  kind: 'counter' | 'toggle';
  value: number;
  max: number;
  onChange: (delta: number) => void;
}) {
  const { label, sub, kind, value, max, onChange } = props;
  const t = useT();
  return (
    <div className={styles.row}>
      <div>
        <div className={styles.rowLabel}>{label}</div>
        <div className={styles.rowSub}>{sub}</div>
      </div>
      {kind === 'toggle' ? (
        <button
          type="button"
          className={`${styles.toggle} ${value ? styles.toggleOn : ''}`}
          aria-pressed={value > 0}
          aria-label={t(value ? 'booking.removeAria' : 'booking.addAria', { label })}
          onClick={() => onChange(value ? -1 : 1)}
        >
          {t(value ? 'booking.remove' : 'booking.add')}
        </button>
      ) : (
        <div className={styles.counter}>
          <button type="button" onClick={() => onChange(-1)} disabled={value === 0} aria-label={t('booking.decrease', { label })}>
            −
          </button>
          <output aria-live="polite" aria-label={t('booking.count', { label })}>
            {value}
          </output>
          <button type="button" onClick={() => onChange(1)} disabled={value >= max} aria-label={t('booking.increase', { label })}>
            +
          </button>
        </div>
      )}
    </div>
  );
}
