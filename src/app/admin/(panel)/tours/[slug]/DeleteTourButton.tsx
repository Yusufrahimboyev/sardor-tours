'use client';

import styles from '../../../admin.module.css';

export function DeleteTourButton({ action, name }: { action: () => Promise<void>; name: string }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        const ok = window.confirm(
          `"${name}" butunlay o‘chirilsinmi?\n\nBu tur bo‘yicha qilingan bronlar saqlanib qoladi. Vaqtincha olib tashlash uchun "Yashirin" qilib qo‘yish kifoya.`,
        );
        if (!ok) e.preventDefault();
      }}
    >
      <button type="submit" className={styles.btnRed}>
        O‘chirish
      </button>
    </form>
  );
}
