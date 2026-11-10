'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import type { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/Toast';
import { CheckIcon } from '@/components/icons';
import { useLang, useT } from '@/i18n/client';
import { contactSchema, isErrorKey } from '@/lib/validation';
import styles from './contact.module.css';

const formSchema = contactSchema.omit({ lang: true });
type ContactInput = z.infer<typeof formSchema>;

export function ContactForm() {
  const t = useT();
  const lang = useLang();
  const toast = useToast();
  /** Schema messages are `ErrorKey`s; server messages arrive already translated. */
  const fieldMsg = (m?: string) => (m ? (isErrorKey(m) ? t('errors.' + m) : m) : undefined);
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: { name: '', email: '', phone: '', topic: 'booking', message: '', company: '' },
  });

  const onSubmit = async (v: ContactInput) => {
    try {
      const res = await fetch('/api/contact/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...v, lang }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };
      if (!res.ok || !data.ok) {
        for (const [k, m] of Object.entries(data.fieldErrors ?? {})) setError(k as keyof ContactInput, { message: m });
        toast(data.error ?? t('errors.generic'), 'error');
        return;
      }
      reset();
      setSent(true);
      toast(t('toast.messageSent'), 'success');
    } catch {
      toast(t('errors.network'), 'error');
    }
  };

  if (sent) {
    return (
      <div className={styles.success} role="status">
        <span className={styles.successIc}>
          <CheckIcon size={26} />
        </span>
        <h2>{t('contactForm.thanks')}</h2>
        <p>{t('contactForm.received')}</p>
        <button type="button" className={styles.secondary} onClick={() => setSent(false)}>
          {t('contactForm.another')}
        </button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <input type="text" tabIndex={-1} autoComplete="off" className={styles.hp} aria-hidden {...register('company')} />
      <div className={styles.row}>
        <Field label={t('contactForm.name')} error={fieldMsg(errors.name?.message)} id="c-name">
          <input id="c-name" autoComplete="name" aria-invalid={!!errors.name} {...register('name')} />
        </Field>
        <Field label={t('contactForm.email')} error={fieldMsg(errors.email?.message)} id="c-email">
          <input id="c-email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register('email')} />
        </Field>
      </div>
      <div className={styles.row}>
        <Field label={t('contactForm.phone')} error={fieldMsg(errors.phone?.message)} id="c-phone">
          <input id="c-phone" type="tel" autoComplete="tel" aria-invalid={!!errors.phone} {...register('phone')} />
        </Field>
        <Field label={t('contactForm.topic')} id="c-topic">
          <select id="c-topic" {...register('topic')}>
            <option value="booking">{t('contactForm.topics.booking')}</option>
            <option value="private">{t('contactForm.topics.private')}</option>
            <option value="group">{t('contactForm.topics.group')}</option>
            <option value="other">{t('contactForm.topics.other')}</option>
          </select>
        </Field>
      </div>
      <Field label={t('contactForm.message')} error={fieldMsg(errors.message?.message)} id="c-msg">
        <textarea id="c-msg" rows={5} aria-invalid={!!errors.message} {...register('message')} />
      </Field>
      <button type="submit" className={styles.submit} disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? t('contactForm.sending') : t('contactForm.send')}
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
