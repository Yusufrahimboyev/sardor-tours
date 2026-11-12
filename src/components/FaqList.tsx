import styles from './FaqList.module.css';

/** Native <details> accordion — works without JS and is keyboard accessible. */
export function FaqList({ items, variant }: { items: { q: string; a: string }[]; variant?: 'soft' }) {
  return (
    <div className={`${styles.list} ${variant === 'soft' ? styles.soft : ''}`}>
      {items.map((f) => (
        <details key={f.q} className={styles.item}>
          <summary>
            <span>{f.q}</span>
            <span className={styles.ic} aria-hidden />
          </summary>
          <div className={styles.a}>{f.a}</div>
        </details>
      ))}
    </div>
  );
}
