'use client';

import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Tour } from '@/data/tours';
import { formatLongDate, tomorrowISO, weekdayNames } from '@/lib/dates';
import { formatGBP, optionMax, optionPriceLabel, quote, type Quantities } from '@/lib/pricing';
import { bookingIssues, contactDetailsSchema } from '@/lib/validation';
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

const STEPS = ['Date', 'Guests', 'Details'] as const;

/** zod field validator → react-hook-form `validate` function. */
function zField<K extends keyof typeof contactDetailsSchema.shape>(key: K) {
  return (v: string) => {
    const r = contactDetailsSchema.shape[key].safeParse(v);
    return r.success || r.error.issues[0].message;
  };
}

/**
 * Booking request form.
 * - default: three steps (date → guests → details), used in the mobile booking dialog.
 * - `single`: everything on one screen with the submit button pinned to the bottom
 *   (desktop sidebar, matching the reference "Book your spot" panel).
 */
export function BookingForm({ tour, compact, single }: { tour: Tour; compact?: boolean; single?: boolean }) {
  const router = useRouter();
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
    return issue ? issue.message : true;
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
        setQtyError('Please add at least one guest');
        return;
      }
      setStep(2);
    }
  };

  const onSubmit = async (v: Values) => {
    if (q.guestUnits === 0) {
      setStep(1);
      setQtyError('Please add at least one guest');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...v, tourSlug: tour.slug, qty }),
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
        toast(data.error ?? 'Something went wrong. Please try again.', 'error');
        return;
      }
      toast('Booking request sent!', 'success');
      router.push(`/booking/${data.reference}/`);
    } catch {
      toast('Network error — please check your connection and try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const fid = (n: string) => `${uid}-${n}`;

  if (single) {
    const fieldErr = (k: keyof Values) => (errors[k] ? <p className={styles.err}>{errors[k]?.message}</p> : null);
    return (
      <form className={`${styles.form} ${styles.single}`} onSubmit={handleSubmit(onSubmit)} noValidate>
        <input type="text" tabIndex={-1} autoComplete="off" className={styles.hp} aria-hidden {...register('company')} />
        <div className={styles.singleBody}>
          <label className={styles.label} htmlFor={fid('hotel')}>
            Hotel name
          </label>
          <input
            id={fid('hotel')}
            type="text"
            placeholder="Your hotel name"
            autoComplete="off"
            className={`${styles.input} ${styles.inputSm} ${errors.hotel ? styles.invalid : ''}`}
            aria-invalid={!!errors.hotel}
            {...register('hotel', { validate: (v) => v.trim().length >= 2 || 'Please enter your hotel name' })}
          />
          {fieldErr('hotel')}

          <label className={styles.label} htmlFor={fid('date')}>
            Select a date
          </label>
          <input
            id={fid('date')}
            type="date"
            min={tomorrowISO()}
            className={`${styles.input} ${errors.date ? styles.invalid : ''}`}
            aria-invalid={!!errors.date}
            {...register('date', { validate: () => issueFor('date') })}
          />
          {errors.date ? (
            fieldErr('date')
          ) : tour.scheduleDays ? (
            <p className={styles.hint}>Runs on {weekdayNames(tour.scheduleDays)}</p>
          ) : null}

          {tour.timeSlots.length > 0 && (
            <fieldset className={styles.fieldset}>
              <legend className={styles.label}>Departure time</legend>
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
              {fieldErr('time')}
            </fieldset>
          )}

          <div className={styles.label}>Guests</div>
          <div className={styles.rows}>
            {guests.map((o) => (
              <OptionRow key={o.key} label={o.label} sub={optionPriceLabel(o, true)} kind={o.kind} value={qty[o.key] ?? 0} max={optionMax(o)} onChange={(d) => change(o.key, d)} />
            ))}
          </div>
          {extras.length > 0 && <div className={styles.label}>Extras</div>}
          <div className={styles.rows}>
            {extras.map((o) => (
              <OptionRow key={o.key} label={o.label} sub={optionPriceLabel(o, true)} kind={o.kind} value={qty[o.key] ?? 0} max={optionMax(o)} onChange={(d) => change(o.key, d)} />
            ))}
          </div>
          {qtyError && (
            <p className={styles.err} role="alert">
              {qtyError}
            </p>
          )}
          <div className={styles.total}>
            <span>Total</span>
            <b data-testid="booking-total">{formatGBP(q.total)}</b>
          </div>

          <div className={styles.label}>Your details</div>
          <div className={styles.pair}>
            <div>
              <input
                id={fid('name')}
                placeholder="Full name"
                aria-label="Full name"
                className={`${styles.input} ${styles.inputSm} ${errors.name ? styles.invalid : ''}`}
                autoComplete="name"
                aria-invalid={!!errors.name}
                {...register('name', { validate: zField('name') })}
              />
              {fieldErr('name')}
            </div>
            <div>
              <input
                id={fid('phone')}
                type="tel"
                placeholder="WhatsApp number"
                aria-label="Phone / WhatsApp"
                className={`${styles.input} ${styles.inputSm} ${errors.phone ? styles.invalid : ''}`}
                autoComplete="tel"
                aria-invalid={!!errors.phone}
                {...register('phone', { validate: zField('phone') })}
              />
              {fieldErr('phone')}
            </div>
          </div>
          {tour.requiresDeposit && (
            <p className={styles.deposit}>This experience requires a deposit — our team will send you the payment details.</p>
          )}
        </div>
        <div className={styles.singleFoot}>
          <button type="submit" className={styles.primary} disabled={submitting} aria-busy={submitting}>
            {submitting ? 'Sending…' : 'Book now'}
          </button>
          <p className={styles.note}>Book now — no prepayment</p>
        </div>
      </form>
    );
  }

  return (
    <form className={`${styles.form} ${compact ? styles.compact : ''}`} onSubmit={handleSubmit(onSubmit)} noValidate>
      <ol className={styles.steps} aria-label="Booking steps">
        {STEPS.map((s, i) => (
          <li key={s} className={i === step ? styles.stepOn : i < step ? styles.stepDone : ''} aria-current={i === step ? 'step' : undefined}>
            <span>{i < step ? <CheckIcon size={13} /> : i + 1}</span>
            {s}
          </li>
        ))}
      </ol>

      {/* honeypot */}
      <input type="text" tabIndex={-1} autoComplete="off" className={styles.hp} aria-hidden {...register('company')} />

      <div hidden={step !== 0} className={styles.pane}>
        <label className={styles.label} htmlFor={fid('date')}>
          Select a date
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
          {errors.date?.message ?? (tour.scheduleDays ? `Runs on ${weekdayNames(tour.scheduleDays)}` : `Schedule: ${tour.schedule}`)}
        </p>

        {tour.timeSlots.length > 0 && (
          <fieldset className={styles.fieldset}>
            <legend className={styles.label}>Departure time</legend>
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
          Hotel name
        </label>
        <input
          id={fid('hotel')}
          type="text"
          placeholder="Your hotel name"
          autoComplete="off"
          className={`${styles.input} ${errors.hotel ? styles.invalid : ''}`}
          aria-invalid={!!errors.hotel}
          {...register('hotel', {
            validate: (v) => v.trim().length >= 2 || 'Please enter your hotel name',
          })}
        />
        {errors.hotel && <p className={styles.err}>{errors.hotel.message}</p>}

        <button type="button" className={styles.primary} onClick={next}>
          Next
        </button>
        <p className={styles.note}>Book now — no prepayment</p>
      </div>

      <div hidden={step !== 1} className={styles.pane}>
        <div className={styles.summary}>
          <div>
            <small>Date</small>
            <b>
              {date ? formatLongDate(date) : '—'}
              {time ? ` · ${time}` : ''}
            </b>
          </div>
          <button type="button" onClick={() => setStep(0)}>
            Change
          </button>
        </div>
        <div className={styles.label}>Guests</div>
        {guests.map((o) => (
          <OptionRow key={o.key} label={o.label} sub={optionPriceLabel(o)} kind={o.kind} value={qty[o.key] ?? 0} max={optionMax(o)} onChange={(d) => change(o.key, d)} />
        ))}
        {extras.length > 0 && <div className={styles.extras}>Extras</div>}
        {extras.map((o) => (
          <OptionRow key={o.key} label={o.label} sub={optionPriceLabel(o)} kind={o.kind} value={qty[o.key] ?? 0} max={optionMax(o)} onChange={(d) => change(o.key, d)} />
        ))}
        {qtyError && (
          <p className={styles.err} role="alert">
            {qtyError}
          </p>
        )}
        <div className={styles.total}>
          <span>Total</span>
          <b data-testid="booking-total">{formatGBP(q.total)}</b>
        </div>
        <button type="button" className={styles.primary} onClick={next}>
          Next
        </button>
        <button type="button" className={styles.back} onClick={() => setStep(0)}>
          Back
        </button>
      </div>

      <div hidden={step !== 2} className={styles.pane}>
        <label className={styles.label} htmlFor={fid('name')}>
          Full name
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
          Phone / WhatsApp
        </label>
        <input
          id={fid('phone')}
          type="tel"
          placeholder="+44 7700 900123"
          className={`${styles.input} ${errors.phone ? styles.invalid : ''}`}
          autoComplete="tel"
          aria-invalid={!!errors.phone}
          {...register('phone', { validate: zField('phone') })}
        />
        {errors.phone && <p className={styles.err}>{errors.phone.message}</p>}

        <label className={styles.label} htmlFor={fid('email')}>
          Email <span className={styles.opt}>(optional)</span>
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
          Notes <span className={styles.opt}>(optional)</span>
        </label>
        <textarea id={fid('notes')} rows={2} className={styles.input} placeholder="Room number, special requests…" {...register('notes')} />

        <div className={styles.lines}>
          {q.lines.map((l) => (
            <div key={l.key}>
              <span>
                {l.label} × {l.qty}
              </span>
              <span>{formatGBP(l.subtotal)}</span>
            </div>
          ))}
          <div className={styles.total}>
            <span>Total — pay on the day</span>
            <b>{formatGBP(q.total)}</b>
          </div>
        </div>
        {tour.requiresDeposit && (
          <p className={styles.deposit}>This experience requires a deposit — our team will send you the payment details.</p>
        )}
        <button type="submit" className={styles.primary} disabled={submitting} aria-busy={submitting}>
          {submitting ? 'Sending…' : 'Send booking request'}
        </button>
        <button type="button" className={styles.back} onClick={() => setStep(1)}>
          Back
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
  return (
    <div className={styles.row}>
      <div>
        <div className={styles.rowLabel}>{label}</div>
        <div className={`${styles.rowSub} ${sub === 'Free' || sub === 'Included' ? styles.rowFree : ''}`}>{sub}</div>
      </div>
      {kind === 'toggle' ? (
        <button
          type="button"
          className={`${styles.toggle} ${value ? styles.toggleOn : ''}`}
          aria-pressed={value > 0}
          aria-label={`${value ? 'Remove' : 'Add'} ${label}`}
          onClick={() => onChange(value ? -1 : 1)}
        >
          {value ? 'Remove' : 'Add'}
        </button>
      ) : (
        <div className={styles.counter}>
          <button type="button" onClick={() => onChange(-1)} disabled={value === 0} aria-label={`Decrease ${label}`}>
            −
          </button>
          <output aria-live="polite" aria-label={`${label} count`}>
            {value}
          </output>
          <button type="button" onClick={() => onChange(1)} disabled={value >= max} aria-label={`Increase ${label}`}>
            +
          </button>
        </div>
      )}
    </div>
  );
}
