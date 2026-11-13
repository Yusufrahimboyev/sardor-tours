'use client';

import { useActionState } from 'react';
import { login, type LoginState } from '../actions';
import { useAdminDict } from '../i18n/client';
import styles from '../admin.module.css';

export function LoginForm() {
  const t = useAdminDict();
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className={styles.loginForm}>
      <label htmlFor="admin-pw">{t.login.password}</label>
      <input id="admin-pw" name="password" type="password" autoComplete="current-password" required autoFocus />
      {state.error && (
        <p className={styles.err} role="alert">
          {state.error}
        </p>
      )}
      <button type="submit" className={styles.btnPrimary} disabled={pending}>
        {pending ? t.login.submitting : t.login.submit}
      </button>
    </form>
  );
}
