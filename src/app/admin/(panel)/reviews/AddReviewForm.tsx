'use client';

import { useActionState, useEffect, useRef } from 'react';
import { addReviewAction, type FormState } from '../../contentActions';
import { useAdminDict } from '../../i18n/client';
import styles from '../../admin.module.css';

export function AddReviewForm() {
  const t = useAdminDict();
  const R = t.reviews;
  const [state, action, pending] = useActionState<FormState, FormData>(addReviewAction, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.saved) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className={styles.card} style={{ marginTop: 12 }}>
      <h2>{R.addTitle}</h2>
      <div className={styles.fields}>
        <div className={styles.field}>
          <label htmlFor="rv-name">{R.name}</label>
          <input id="rv-name" name="name" required placeholder="Anna K." />
        </div>
        <div className={styles.field}>
          <label htmlFor="rv-meta">{R.meta}</label>
          <input id="rv-meta" name="meta" placeholder="London · Ras Mohamed trip" />
        </div>
        <div className={`${styles.field} ${styles.wide}`}>
          <label htmlFor="rv-text">{R.text}</label>
          <textarea id="rv-text" name="text" rows={3} required />
        </div>
        <div className={styles.field}>
          <label htmlFor="rv-rating">{R.rating}</label>
          <select id="rv-rating" name="rating" defaultValue="5">
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {'★'.repeat(n)}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="rv-lang">{R.lang}</label>
          <select id="rv-lang" name="lang" defaultValue="all">
            <option value="all">{R.langAll}</option>
            <option value="en">{R.langOnly} EN</option>
            <option value="ru">{R.langOnly} RU</option>
            <option value="uz">{R.langOnly} UZ</option>
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
          {pending ? t.common.saving : R.submit}
        </button>
      </div>
    </form>
  );
}
