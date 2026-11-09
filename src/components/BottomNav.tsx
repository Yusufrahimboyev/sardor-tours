'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { TourSummary } from '@/data/tours';
import { useLang, useT } from '@/i18n/client';
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher';
import { localeHref } from '@/i18n/routing';
import { ContactOptions } from './ContactOptions';
import { ChatIcon, ChevronLeft, HomeIcon, InfoIcon, SearchIcon, VideoIcon } from './icons';
import { Modal } from './Modal';
import { TourSearch } from './TourSearch';
import styles from './BottomNav.module.css';

export const OPEN_CONTACT = 'st:open-contact';
export const OPEN_SEARCH = 'st:open-search';

export function openContact() {
  window.dispatchEvent(new Event(OPEN_CONTACT));
}

interface Props {
  tours: TourSummary[];
  /** Show a "Back" item (tour detail pages). */
  withBack?: boolean;
  /** Only reveal after scrolling past this many px (destination page hero). */
  revealAfter?: number;
  /** top = full-width bar pinned to the top (tour pages, like the reference). */
  placement?: 'top' | 'bottom';
}

/** Floating pill navigation used on the destination & tour pages (all widths, like the reference). */
export function BottomNav({ tours, withBack, revealAfter = 0, placement = 'bottom' }: Props) {
  const lang = useLang();
  const t = useT();
  const pathname = usePathname();
  const router = useRouter();
  const [visible, setVisible] = useState(revealAfter === 0);
  const [panel, setPanel] = useState<'none' | 'search' | 'contact'>('none');

  useEffect(() => {
    if (!revealAfter) return;
    const onScroll = () => setVisible(window.scrollY > revealAfter);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [revealAfter]);

  useEffect(() => {
    const c = () => setPanel('contact');
    const s = () => setPanel('search');
    window.addEventListener(OPEN_CONTACT, c);
    window.addEventListener(OPEN_SEARCH, s);
    return () => {
      window.removeEventListener(OPEN_CONTACT, c);
      window.removeEventListener(OPEN_SEARCH, s);
    };
  }, []);

  const home = localeHref(lang, '/sharm/');
  const close = () => setPanel('none');
  const back = () => {
    if (window.history.length > 1 && document.referrer.startsWith(window.location.origin)) router.back();
    else router.push(home);
  };

  return (
    <>
      <nav className={`${styles.nav} ${placement === 'top' ? styles.top : ''} ${visible ? styles.visible : ''}`} aria-label={t('nav.quick')}>
        {withBack && (
          <button type="button" className={styles.item} onClick={back}>
            <ChevronLeft />
            {t('nav.back')}
          </button>
        )}
        <Link href={home} className={`${styles.item} ${pathname.replace(/\/$/, '') === home.replace(/\/$/, '') ? styles.active : ''}`}>
          <HomeIcon />
          {t('nav.home')}
        </Link>
        <button type="button" className={styles.item} onClick={() => setPanel('search')}>
          <SearchIcon size={20} />
          {t('nav.search')}
        </button>
        <button type="button" className={styles.item} onClick={() => setPanel('contact')}>
          <ChatIcon />
          {t('nav.contact')}
        </button>
        {!withBack && (
          <Link href={localeHref(lang, '/sharm/video/')} className={styles.item}>
            <VideoIcon />
            {t('nav.videos')}
          </Link>
        )}
        <Link href={localeHref(lang, '/about-us/')} className={styles.item}>
          <InfoIcon />
          {t('nav.about')}
        </Link>
        <LanguageSwitcher tone="dark" />
      </nav>

      <Modal open={panel === 'search'} onClose={close} label={t('search.title')} variant="panel">
        <TourSearch tours={tours} onNavigate={close} />
      </Modal>
      <Modal open={panel === 'contact'} onClose={close} label={t('contactOptions.title')}>
        <ContactOptions onNavigate={close} />
      </Modal>
    </>
  );
}
