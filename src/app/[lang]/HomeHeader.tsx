'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Brand } from '@/components/Brand';
import { PLAN_TRIP_MSG, whatsappLink } from '@/data/site';
import { XIcon } from '@/components/icons';
import type { Locale } from '@/i18n/config';
import { localeHref } from '@/i18n/routing';
import styles from './home.module.css';

export function HomeHeader({ lang }: { lang: Locale }) {
  const links = [
    { href: '#destinations', label: 'Destinations' },
    { href: '#why', label: 'Why us' },
    { href: '#contact', label: 'Contact' },
    { href: localeHref(lang, '/about-us/'), label: 'About us' },
  ];
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
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

  const wa = whatsappLink(PLAN_TRIP_MSG);

  return (
    <>
      <header className={`${styles.hdr} ${solid ? styles.solid : ''}`}>
        <div className={`wrap ${styles.hdrIn}`}>
          <Brand lang={lang} />
          <nav className={styles.nav} aria-label="Main">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={styles.lnk}>
                {l.label}
              </Link>
            ))}
            <a href={wa} target="_blank" rel="noopener noreferrer" className={`btn-wa ${styles.hdrCta}`}>
              WhatsApp
            </a>
            <button
              type="button"
              className={styles.burger}
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="mmenu"
              onClick={() => setOpen(true)}
            >
              <span />
              <span />
              <span />
            </button>
          </nav>
        </div>
      </header>

      <div id="mmenu" className={`${styles.mmenu} ${open ? styles.open : ''}`} aria-hidden={!open} role="dialog" aria-label="Menu">
        <button type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="Close menu" tabIndex={open ? 0 : -1}>
          <XIcon size={28} />
        </button>
        {links.map((l) => (
          <Link key={l.href} href={l.href} onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
            {l.label}
          </Link>
        ))}
        <Link href={localeHref(lang, '/sharm/')} onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
          Sharm El Sheikh tours
        </Link>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-wa" tabIndex={open ? 0 : -1}>
          Message us on WhatsApp
        </a>
      </div>
    </>
  );
}
