'use client';

import { useActionState } from 'react';
import { login, type LoginState } from '../actions';
import styles from '../admin.module.css';

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className={styles.loginForm}>
      <label htmlFor="admin-pw">Parol</label>
      <input id="admin-pw" name="password" type="password" autoComplete="current-password" required autoFocus />
      {state.error && (
        <p className={styles.err} role="alert">
          {state.error}
        </p>
      )}
      <button type="submit" className={styles.btnPrimary} disabled={pending}>
        {pending ? 'Kirilmoqda…' : 'Kirish'}
      </button>
    </form>
  );
}
