'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogoMark } from '@/components/Brand';
import { site } from '@/data/site';
import { href, LOCALE_COOKIE, LOCALE_NAMES, LOCALE_SHORT, LOCALES, PATHS, type Locale } from '@/i18n/config';
import type { Dict } from '@/i18n';
import s from './site.module.css';

/** Same page in another language: swap the first path segment. */
function switchPath(pathname: string, to: Locale) {
  const parts = pathname.split('/');
  parts[1] = to;
  return parts.join('/') || `/${to}/`;
}

function rememberLocale(l: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
}

export function SiteHeader({ locale, t }: { locale: Locale; t: Dict['nav'] }) {
  const pathname = usePathname() || `/${locale}/`;
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const links = [
    [PATHS.home, t.home],
    [PATHS.tours, t.tours],
    [PATHS.about, t.about],
    [PATHS.guide, t.guide],
    [PATHS.contacts, t.contacts],
  ] as const;
  const isCurrent = (p: string) => {
    const full = href(locale, p);
    return p === PATHS.home ? pathname === full : pathname.startsWith(full);
  };

  const langSwitch = (extra = '') => (
    <nav className={`${s.langs} ${extra}`} aria-label={t.language}>
      {LOCALES.map((l) => (
        <a
          key={l}
          href={switchPath(pathname, l)}
          hrefLang={l}
          lang={l}
          title={LOCALE_NAMES[l]}
          aria-current={l === locale}
          onClick={() => rememberLocale(l)}
        >
          {LOCALE_SHORT[l]}
        </a>
      ))}
    </nav>
  );

  return (
    <header className={s.header}>
      <a href="#main-content" className="skip-link">
        {t.skip}
      </a>
      <div className={`${s.wrap} ${s.headerIn}`}>
        <Link href={href(locale, PATHS.home)} className={s.logo}>
          <LogoMark size={34} />
          {site.name}
        </Link>
        <nav className={s.nav} aria-label={t.menu}>
          {links.map(([p, label]) => (
            <Link key={p} href={href(locale, p)} aria-current={isCurrent(p) ? 'page' : undefined}>
              {label}
            </Link>
          ))}
        </nav>
        {langSwitch(s.desktopOnly)}
        <button type="button" className={s.burger} aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen((o) => !o)}>
          <span className="sr-only">{open ? t.close : t.menu}</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>
      <div id="mobile-nav" className={s.mobileNav} hidden={!open}>
        {links.map(([p, label]) => (
          <Link key={p} href={href(locale, p)} aria-current={isCurrent(p) ? 'page' : undefined}>
            {label}
          </Link>
        ))}
        {langSwitch()}
      </div>
    </header>
  );
}
