'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Brand } from '@/components/Brand';
import { whatsappLink } from '@/data/site';
import { XIcon } from '@/components/icons';
import { useLang, useT } from '@/i18n/client';
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher';
import { localeHref } from '@/i18n/routing';
import styles from './home.module.css';

export function HomeHeader() {
  const lang = useLang();
  const t = useT();
  const links = [
    { href: '#destinations', label: t('nav.destinations') },
    { href: '#why', label: t('nav.whyUs') },
    { href: '#contact', label: t('nav.contact') },
    { href: localeHref(lang, '/about-us/'), label: t('nav.aboutUs') },
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

  const wa = whatsappLink(t('whatsapp.planTrip'));

  return (
    <>
      <header className={`${styles.hdr} ${solid ? styles.solid : ''}`}>
        <div className={`wrap ${styles.hdrIn}`}>
          <Brand />
          <nav className={styles.nav} aria-label={t('nav.main')}>
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={styles.lnk}>
                {l.label}
              </Link>
            ))}
            <LanguageSwitcher />
            <a href={wa} target="_blank" rel="noopener noreferrer" className={`btn-wa ${styles.hdrCta}`}>
              {t('nav.whatsapp')}
            </a>
            <button
              type="button"
              className={styles.burger}
              aria-label={t('nav.openMenu')}
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

      <div id="mmenu" className={`${styles.mmenu} ${open ? styles.open : ''}`} aria-hidden={!open} role="dialog" aria-label={t('nav.menu')}>
        <button type="button" className={styles.close} onClick={() => setOpen(false)} aria-label={t('nav.closeMenu')} tabIndex={open ? 0 : -1}>
          <XIcon size={28} />
        </button>
        {links.map((l) => (
          <Link key={l.href} href={l.href} onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
            {l.label}
          </Link>
        ))}
        <Link href={localeHref(lang, '/sharm/')} onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
          {t('nav.sharmTours')}
        </Link>
        <LanguageSwitcher />
        <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-wa" tabIndex={open ? 0 : -1}>
          {t('nav.messageWhatsapp')}
        </a>
      </div>
    </>
  );
}
