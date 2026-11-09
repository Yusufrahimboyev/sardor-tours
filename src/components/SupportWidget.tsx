'use client';

import { useEffect, useState } from 'react';
import { whatsappLink } from '@/data/site';
import { useT } from '@/i18n/client';
import { WhatsAppIcon } from './icons';
import styles from './SupportWidget.module.css';

const MESSAGE_KEYS = ['support.help', 'support.reply'] as const;

/**
 * Floating WhatsApp helper: appears after 15% scroll, then shows a short
 * message bubble a couple of times (mirrors the reference behaviour).
 */
export function SupportWidget({ always = false }: { always?: boolean }) {
  const t = useT();
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
    MESSAGE_KEYS.forEach((_, i) => {
      timers.push(setTimeout(() => setPill(i), 1800 + i * 20000));
      timers.push(setTimeout(() => setPill(null), 1800 + i * 20000 + 7000));
    });
    return () => timers.forEach(clearTimeout);
  }, [shown]);

  const href = whatsappLink(t('whatsapp.bookTour'));
  const msgKey = MESSAGE_KEYS[pill ?? 0];
  const msg = pill === null ? null : msgKey;

  return (
    <div className={`${styles.root} ${shown ? styles.shown : ''}`}>
      <a href={href} target="_blank" rel="noopener noreferrer" className={styles.avatar} aria-label={t('support.chatAria')}>
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
        <b>{t(`${msgKey}.title`)}</b>
        <span>
          <i />
          {t(`${msgKey}.sub`)}
        </span>
      </a>
    </div>
  );
}
