'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BOOK_TOUR_MSG, whatsappLink } from '@/data/site';
import { Brand } from './Brand';
import { WhatsAppIcon, XIcon } from './icons';
import styles from './SiteHeader.module.css';

const LINKS = [
  { href: '/en/sharm/', label: 'Excursions' },
  { href: '/en/sharm/video/', label: 'Videos' },
  { href: '/en/about-us/', label: 'About us' },
  { href: '/en/contact/', label: 'Contact' },
];

/** Header for secondary pages. `overlay` = transparent over a dark hero until scrolled. */
export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
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
          <nav className={styles.nav} aria-label="Main">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={styles.lnk}>
                {l.label}
              </Link>
            ))}
            <a href={whatsappLink(BOOK_TOUR_MSG)} target="_blank" rel="noopener noreferrer" className={styles.cta}>
              <WhatsAppIcon size={16} /> WhatsApp
            </a>
            <button
              type="button"
              className={styles.burger}
              aria-label="Open menu"
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
        aria-label="Menu"
        aria-hidden={!open}
      >
        <button
          type="button"
          className={styles.close}
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          tabIndex={open ? 0 : -1}
        >
          <XIcon size={26} />
        </button>
        <Link href="/" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
          Home
        </Link>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
            {l.label}
          </Link>
        ))}
        <a
          href={whatsappLink(BOOK_TOUR_MSG)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-wa"
          tabIndex={open ? 0 : -1}
        >
          Message us on WhatsApp
        </a>
      </div>
    </>
  );
}
