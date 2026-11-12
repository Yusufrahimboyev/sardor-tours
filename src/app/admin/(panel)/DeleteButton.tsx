'use client';

import styles from '../admin.module.css';

export function DeleteButton({ action, confirmText, label = 'O‘chirish' }: { action: () => Promise<void>; confirmText: string; label?: string }) {
  return (
    <form action={action} onSubmit={(e) => !window.confirm(confirmText) && e.preventDefault()}>
      <button type="submit" className={styles.btnRed}>
        {label}
      </button>
    </form>
  );
}
