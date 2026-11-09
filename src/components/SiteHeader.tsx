'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { whatsappLink } from '@/data/site';
import { useLang, useT } from '@/i18n/client';
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher';
import { localeHref } from '@/i18n/routing';
import { Brand } from './Brand';
import { WhatsAppIcon, XIcon } from './icons';
import styles from './SiteHeader.module.css';

const LINKS = [
  { path: '/sharm/', key: 'nav.excursions' },
  { path: '/sharm/video/', key: 'nav.videos' },
  { path: '/about-us/', key: 'nav.aboutUs' },
  { path: '/contact/', key: 'nav.contact' },
];

/** Header for secondary pages. `overlay` = transparent over a dark hero until scrolled. */
export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const lang = useLang();
  const t = useT();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('locked', open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const dark = overlay && !scrolled;

  return (
    <>
      <header className={`${styles.hdr} ${dark ? styles.dark : styles.solid}`}>
        <div className={styles.in}>
          <Brand tone={dark ? 'light' : 'dark'} />
          <nav className={styles.nav} aria-label={t('nav.main')}>
            {LINKS.map((l) => (
              <Link key={l.path} href={localeHref(lang, l.path)} className={styles.lnk}>
                {t(l.key)}
              </Link>
            ))}
            <LanguageSwitcher tone={dark ? 'light' : 'dark'} />
            <a href={whatsappLink(t('whatsapp.bookTour'))} target="_blank" rel="noopener noreferrer" className={styles.cta}>
              <WhatsAppIcon size={16} /> {t('nav.whatsapp')}
            </a>
            <button
              type="button"
              className={styles.burger}
              aria-label={t('nav.openMenu')}
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => setOpen(true)}
            >
              <span />
              <span />
              <span />
            </button>
          </nav>
        </div>
      </header>
      <div
        id="site-menu"
        className={`${styles.menu} ${open ? styles.open : ''}`}
        role="dialog"
        aria-label={t('nav.menu')}
        aria-hidden={!open}
      >
        <button
          type="button"
          className={styles.close}
          onClick={() => setOpen(false)}
          aria-label={t('nav.closeMenu')}
          tabIndex={open ? 0 : -1}
        >
          <XIcon size={26} />
        </button>
        <Link href={localeHref(lang, '/')} onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
          {t('nav.home')}
        </Link>
        {LINKS.map((l) => (
          <Link key={l.path} href={localeHref(lang, l.path)} onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
            {t(l.key)}
          </Link>
        ))}
        <LanguageSwitcher tone="dark" />
        <a
          href={whatsappLink(t('whatsapp.bookTour'))}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-wa"
          tabIndex={open ? 0 : -1}
        >
          {t('nav.messageWhatsapp')}
        </a>
      </div>
    </>
  );
}
