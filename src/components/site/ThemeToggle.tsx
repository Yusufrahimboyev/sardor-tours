'use client';

import { useEffect } from 'react';
import s from './site.module.css';

/**
 * Light / dark switch. The theme lives on <html data-theme> (set before paint by the script in
 * app/layout.tsx), so this button only flips it and remembers the choice; CSS picks the icon.
 */
export function ThemeToggle({ label }: { label: string }) {
  // Pages that Next renders on the client (the 404) never run the inline script, so catch up here.
  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.theme) return;
    let saved: string | null = null;
    try {
      saved = localStorage.getItem('theme');
    } catch {
      /* ignore */
    }
    root.dataset.theme =
      saved === 'light' || saved === 'dark' ? saved : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  const toggle = () => {
    const root = document.documentElement;
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {
      /* private mode: the choice lasts for this page only */
    }
  };
  return (
    <button type="button" className={s.themeBtn} onClick={toggle} aria-label={label} title={label}>
      <svg className={s.moon} viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
      <svg className={s.sun} viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}
