'use client';

import { useEffect, useState } from 'react';
import { BOOK_TOUR_MSG, whatsappLink } from '@/data/site';
import { WhatsAppIcon } from './icons';
import styles from './SupportWidget.module.css';

const MESSAGES = [
  { title: 'Need help?', sub: "We're online" },
  { title: 'We reply fast', sub: 'Message us on WhatsApp' },
];

/**
 * Floating WhatsApp helper: appears after 15% scroll, then shows a short
 * message bubble a couple of times (mirrors the reference behaviour).
 */
export function SupportWidget({ always = false }: { always?: boolean }) {
  const [shown, setShown] = useState(always);
  const [pill, setPill] = useState<number | null>(null);

  useEffect(() => {
    if (shown) return;
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max >= 0.15) setShown(true);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [shown]);

  useEffect(() => {
    if (!shown) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    MESSAGES.forEach((_, i) => {
      timers.push(setTimeout(() => setPill(i), 1800 + i * 20000));
      timers.push(setTimeout(() => setPill(null), 1800 + i * 20000 + 7000));
    });
    return () => timers.forEach(clearTimeout);
  }, [shown]);

  const href = whatsappLink(BOOK_TOUR_MSG);
  const msg = pill === null ? null : MESSAGES[pill];

  return (
    <div className={`${styles.root} ${shown ? styles.shown : ''}`}>
      <a href={href} target="_blank" rel="noopener noreferrer" className={styles.avatar} aria-label="Chat with us on WhatsApp">
        <WhatsAppIcon size={26} />
        <span className={styles.dot} aria-hidden />
      </a>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${styles.pill} ${msg ? styles.pillOn : ''}`}
        aria-hidden={!msg}
        tabIndex={msg ? 0 : -1}
      >
        <b>{msg?.title ?? MESSAGES[0].title}</b>
        <span>
          <i />
          {msg?.sub ?? MESSAGES[0].sub}
        </span>
      </a>
    </div>
  );
}
