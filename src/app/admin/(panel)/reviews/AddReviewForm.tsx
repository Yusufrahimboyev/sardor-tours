'use client';

import { useActionState, useEffect, useRef } from 'react';
import { addReviewAction, type FormState } from '../../contentActions';
import styles from '../../admin.module.css';

export function AddReviewForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(addReviewAction, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.saved) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className={styles.card} style={{ marginTop: 12 }}>
      <h2>+ Yangi sharh</h2>
      <div className={styles.fields}>
        <div className={styles.field}>
          <label htmlFor="rv-name">Mijoz ismi</label>
          <input id="rv-name" name="name" required placeholder="Anna K." />
        </div>
        <div className={styles.field}>
          <label htmlFor="rv-meta">Qo‘shimcha (ixtiyoriy)</label>
          <input id="rv-meta" name="meta" placeholder="London · Ras Mohamed trip" />
        </div>
        <div className={`${styles.field} ${styles.wide}`}>
          <label htmlFor="rv-text">Sharh matni</label>
          <textarea id="rv-text" name="text" rows={3} required />
        </div>
        <div className={styles.field}>
          <label htmlFor="rv-rating">Baho</label>
          <select id="rv-rating" name="rating" defaultValue="5">
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {'★'.repeat(n)}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="rv-lang">Qaysi til versiyasida chiqsin</label>
          <select id="rv-lang" name="lang" defaultValue="all">
            <option value="all">Barcha tillarda</option>
            <option value="en">Faqat EN</option>
            <option value="ru">Faqat RU</option>
            <option value="uz">Faqat UZ</option>
          </select>
        </div>
      </div>
      {state.error && (
        <p className={styles.err} role="alert" style={{ marginTop: 10 }}>
          {state.error}
        </p>
      )}
      <div style={{ marginTop: 12 }}>
        <button type="submit" className={styles.btnPrimary} disabled={pending}>
          {pending ? 'Saqlanmoqda…' : 'Sharhni qo‘shish'}
        </button>
      </div>
    </form>
  );
}
