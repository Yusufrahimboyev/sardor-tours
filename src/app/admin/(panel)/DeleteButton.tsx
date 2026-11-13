'use client';

import { useAdminDict } from '../i18n/client';
import styles from '../admin.module.css';

export function DeleteButton({ action, confirmText, label }: { action: () => Promise<void>; confirmText: string; label?: string }) {
  const t = useAdminDict();
  return (
    <form action={action} onSubmit={(e) => !window.confirm(confirmText) && e.preventDefault()}>
      <button type="submit" className={styles.btnRed}>
        {label ?? t.common.delete}
      </button>
    </form>
  );
}
