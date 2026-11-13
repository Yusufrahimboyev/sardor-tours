'use client';

import { useAdminDict } from '../../../i18n/client';
import styles from '../../../admin.module.css';

export function DeleteTourButton({ action, name }: { action: () => Promise<void>; name: string }) {
  const t = useAdminDict();
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(t.tours.deleteConfirm(name))) e.preventDefault();
      }}
    >
      <button type="submit" className={styles.btnRed}>
        {t.common.delete}
      </button>
    </form>
  );
}
