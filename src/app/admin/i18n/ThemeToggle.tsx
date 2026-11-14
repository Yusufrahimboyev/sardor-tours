import { setAdminThemeAction } from './actions';
import type { AdminTheme } from './config';
import styles from '../admin.module.css';

/** Light / dark switch: posts a tiny server action that stores the choice in a cookie. */
export function AdminThemeToggle({ theme, labels }: { theme: AdminTheme; labels: { toDark: string; toLight: string } }) {
  const next: AdminTheme = theme === 'dark' ? 'light' : 'dark';
  const label = next === 'dark' ? labels.toDark : labels.toLight;
  return (
    <form action={setAdminThemeAction.bind(null, next)}>
      <button type="submit" className={styles.themeBtn} aria-label={label} title={label}>
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          {next === 'dark' ? (
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          ) : (
            <>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </>
          )}
        </svg>
      </button>
    </form>
  );
}
