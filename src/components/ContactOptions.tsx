'use client';

import Link from 'next/link';
import { site, whatsappLink } from '@/data/site';
import { useLang, useT } from '@/i18n/client';
import { localeHref } from '@/i18n/routing';
import { ArrowRight, InstagramIcon, MailIcon, TelegramIcon, WhatsAppIcon } from './icons';
import styles from './ContactOptions.module.css';

/** "Get in touch" messenger list used inside the contact lightbox. */
export function ContactOptions({ onNavigate }: { onNavigate?: () => void }) {
  const lang = useLang();
  const t = useT();
  return (
    <div>
      <h2 className={styles.title}>{t('contactOptions.title')}</h2>
      <p className={styles.sub}>{t('contactOptions.sub')}</p>
      <a href={whatsappLink(t('whatsapp.bookTour'))} target="_blank" rel="noopener noreferrer" className={`${styles.link} ${styles.wa}`}>
        <span className={styles.icon}>
          <WhatsAppIcon size={20} />
        </span>
        <span className={styles.txt}>
          <b>WhatsApp</b>
          <small>{site.phoneDisplay ? `${site.phoneDisplay} · ` : ''}{t('contactOptions.quickReply')}</small>
        </span>
        <ArrowRight />
      </a>
      {site.instagram && (
        <a href={site.instagram} target="_blank" rel="noopener noreferrer" className={`${styles.link} ${styles.ig}`}>
          <span className={styles.icon}>
            <InstagramIcon size={20} />
          </span>
          <span className={styles.txt}>
            <b>Instagram</b>
            <small>{t('contactOptions.instagramSub')}</small>
          </span>
          <ArrowRight />
        </a>
      )}
      {site.telegram && (
        <a href={site.telegram} target="_blank" rel="noopener noreferrer" className={`${styles.link} ${styles.tg}`}>
          <span className={styles.icon}>
            <TelegramIcon size={20} />
          </span>
          <span className={styles.txt}>
            <b>Telegram</b>
            <small>{t('contactOptions.telegramSub')}</small>
          </span>
          <ArrowRight />
        </a>
      )}
      <Link href={localeHref(lang, '/contact/')} onClick={onNavigate} className={`${styles.link} ${styles.form}`}>
        <span className={styles.icon}>
          <MailIcon size={20} />
        </span>
        <span className={styles.txt}>
          <b>{t('contactOptions.formTitle')}</b>
          <small>{t('contactOptions.formSub')}</small>
        </span>
        <ArrowRight />
      </Link>
    </div>
  );
}
