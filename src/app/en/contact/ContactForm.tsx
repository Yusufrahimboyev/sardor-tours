'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/Toast';
import { CheckIcon } from '@/components/icons';
import { contactSchema, type ContactInput } from '@/lib/validation';
import styles from './contact.module.css';

export function ContactForm() {
  const toast = useToast();
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    mode: 'onTouched',
    defaultValues: { name: '', email: '', phone: '', topic: 'booking', message: '', company: '' },
  });

  const onSubmit = async (v: ContactInput) => {
    try {
      const res = await fetch('/api/contact/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(v),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };
      if (!res.ok || !data.ok) {
        for (const [k, m] of Object.entries(data.fieldErrors ?? {})) setError(k as keyof ContactInput, { message: m });
        toast(data.error ?? 'Something went wrong. Please try again.', 'error');
        return;
      }
      reset();
      setSent(true);
      toast("Message sent — we'll reply soon!", 'success');
    } catch {
      toast('Network error — please check your connection and try again.', 'error');
    }
  };

  if (sent) {
    return (
      <div className={styles.success} role="status">
        <span className={styles.successIc}>
          <CheckIcon size={26} />
        </span>
        <h2>Thank you!</h2>
        <p>Your message has been received. Our team usually replies within a few hours.</p>
        <button type="button" className={styles.secondary} onClick={() => setSent(false)}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <input type="text" tabIndex={-1} autoComplete="off" className={styles.hp} aria-hidden {...register('company')} />
      <div className={styles.row}>
        <Field label="Your name" error={errors.name?.message} id="c-name">
          <input id="c-name" autoComplete="name" aria-invalid={!!errors.name} {...register('name')} />
        </Field>
        <Field label="Email" error={errors.email?.message} id="c-email">
          <input id="c-email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register('email')} />
        </Field>
      </div>
      <div className={styles.row}>
        <Field label="Phone / WhatsApp (optional)" error={errors.phone?.message} id="c-phone">
          <input id="c-phone" type="tel" autoComplete="tel" aria-invalid={!!errors.phone} {...register('phone')} />
        </Field>
        <Field label="Topic" id="c-topic">
          <select id="c-topic" {...register('topic')}>
            <option value="booking">Question about a booking</option>
            <option value="private">Private tour</option>
            <option value="group">Group booking</option>
            <option value="other">Something else</option>
          </select>
        </Field>
      </div>
      <Field label="Message" error={errors.message?.message} id="c-msg">
        <textarea id="c-msg" rows={5} aria-invalid={!!errors.message} {...register('message')} />
      </Field>
      <button type="submit" className={styles.submit} disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}

function Field({ label, error, id, children }: { label: string; error?: string; id: string; children: React.ReactNode }) {
  return (
    <div className={`${styles.field} ${error ? styles.invalid : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <p className={styles.err}>{error}</p>}
    </div>
  );
}
