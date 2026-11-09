'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LOCALES, LOCALE_LABEL, type Locale } from './config';
import { useLang, useT } from './client';
import { switchLocalePath } from './routing';
import styles from './LanguageSwitcher.module.css';

const LANGUAGE_NAME: Record<Locale, string> = { uz: "O'zbekcha", en: 'English', ru: 'Русский' };

/** UZ / EN / RU links. Keeps the current path and query, and remembers the choice in the `lang` cookie. */
export function LanguageSwitcher({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const lang = useLang();
  const t = useT();
  const pathname = usePathname();
  const router = useRouter();

  const go = (e: React.MouseEvent<HTMLAnchorElement>, to: Locale) => {
    // Let modified clicks (new tab etc.) fall through to the plain href.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    document.cookie = `lang=${to}; Path=/; Max-Age=31536000; SameSite=Lax`;
    const { pathname: p, search, hash } = window.location;
    router.push(switchLocalePath(p, search, to) + hash);
  };

  return (
    <div className={`${styles.sw} ${tone === 'dark' ? styles.dark : ''}`} role="group" aria-label={t('common.language')}>
      {LOCALES.map((l) => (
        <Link
          key={l}
          href={switchLocalePath(pathname, '', l)}
          hrefLang={l}
          lang={l}
          title={LANGUAGE_NAME[l]}
          aria-current={l === lang ? 'true' : undefined}
          className={`${styles.opt} ${l === lang ? styles.on : ''}`}
          onClick={(e) => go(e, l)}
        >
          {LOCALE_LABEL[l]}
        </Link>
      ))}
    </div>
  );
}
