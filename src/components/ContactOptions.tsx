import Link from 'next/link';
import { BOOK_TOUR_MSG, site, whatsappLink } from '@/data/site';
import type { Locale } from '@/i18n/config';
import { localeHref } from '@/i18n/routing';
import { ArrowRight, InstagramIcon, MailIcon, TelegramIcon, WhatsAppIcon } from './icons';
import styles from './ContactOptions.module.css';

/** "Get in touch" messenger list used inside the contact lightbox. */
export function ContactOptions({ lang, onNavigate }: { lang: Locale; onNavigate?: () => void }) {
  return (
    <div>
      <h2 className={styles.title}>Get in touch</h2>
      <p className={styles.sub}>Reach us on your favourite messenger — we&apos;re available 24/7.</p>
      <a href={whatsappLink(BOOK_TOUR_MSG)} target="_blank" rel="noopener noreferrer" className={`${styles.link} ${styles.wa}`}>
        <span className={styles.icon}>
          <WhatsAppIcon size={20} />
        </span>
        <span className={styles.txt}>
          <b>WhatsApp</b>
          <small>{site.phoneDisplay ? `${site.phoneDisplay} · ` : ''}Quick reply</small>
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
            <small>Follow &amp; DM us</small>
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
            <small>Message us on Telegram</small>
          </span>
          <ArrowRight />
        </a>
      )}
      <Link href={localeHref(lang, '/contact/')} onClick={onNavigate} className={`${styles.link} ${styles.form}`}>
        <span className={styles.icon}>
          <MailIcon size={20} />
        </span>
        <span className={styles.txt}>
          <b>Contact form</b>
          <small>We reply by email</small>
        </span>
        <ArrowRight />
      </Link>
    </div>
  );
}
