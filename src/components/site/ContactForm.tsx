'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Dict } from '@/i18n';
import s from './site.module.css';

interface Values {
  name: string;
  email: string;
  phone: string;
  topic: 'booking' | 'private' | 'group' | 'other';
  message: string;
  company: string;
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phoneRe = /^\+?[0-9 ()-]{7,20}$/;

/** Feedback / contact form. Posts to /api/contact/ (stored and shown in Admin → Xabarlar). */
export function ContactForm({ t }: { t: Dict['contact'] }) {
  const [state, setState] = useState<'idle' | 'sent' | 'error'>('idle');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    mode: 'onTouched',
    defaultValues: { name: '', email: '', phone: '', topic: 'booking', message: '', company: '' },
  });

  const onSubmit = async (v: Values) => {
    setState('idle');
    try {
      const res = await fetch('/api/contact/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(v) });
      if (!res.ok) throw new Error();
      reset();
      setState('sent');
    } catch {
      setState('error');
    }
  };

  if (state === 'sent') {
    return (
      <p className={s.ok} role="status">
        {t.sent}
      </p>
    );
  }

  return (
    <form className={s.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <input type="text" tabIndex={-1} autoComplete="off" className={s.hp} aria-hidden {...register('company')} />
      <div className={s.row2}>
        <div className={s.field}>
          <label htmlFor="cf-name">{t.name}</label>
          <input id="cf-name" autoComplete="name" aria-invalid={!!errors.name} {...register('name', { validate: (v) => v.trim().length >= 2 || t.errors.name })} />
          {errors.name && <p className={s.err}>{errors.name.message}</p>}
        </div>
        <div className={s.field}>
          <label htmlFor="cf-email">{t.email}</label>
          <input
            id="cf-email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register('email', { validate: (v) => emailRe.test(v.trim()) || t.errors.email })}
          />
          {errors.email && <p className={s.err}>{errors.email.message}</p>}
        </div>
      </div>
      <div className={s.row2}>
        <div className={s.field}>
          <label htmlFor="cf-phone">{t.phone}</label>
          <input
            id="cf-phone"
            type="tel"
            autoComplete="tel"
            aria-invalid={!!errors.phone}
            {...register('phone', { validate: (v) => !v.trim() || phoneRe.test(v.trim()) || t.errors.phone })}
          />
          {errors.phone && <p className={s.err}>{errors.phone.message}</p>}
        </div>
        <div className={s.field}>
          <label htmlFor="cf-topic">{t.topic}</label>
          <select id="cf-topic" {...register('topic')}>
            {(Object.keys(t.topics) as (keyof typeof t.topics)[]).map((k) => (
              <option key={k} value={k}>
                {t.topics[k]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className={s.field}>
        <label htmlFor="cf-msg">{t.message}</label>
        <textarea
          id="cf-msg"
          rows={5}
          aria-invalid={!!errors.message}
          {...register('message', { validate: (v) => v.trim().length >= 10 || t.errors.message })}
        />
        {errors.message && <p className={s.err}>{errors.message.message}</p>}
      </div>
      {state === 'error' && (
        <p className={s.err} role="alert">
          {t.failed}
        </p>
      )}
      <div>
        <button type="submit" className={s.btn} disabled={isSubmitting}>
          {isSubmitting ? t.sending : t.send}
        </button>
      </div>
    </form>
  );
}
