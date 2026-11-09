import Link from 'next/link';
import { site, whatsappLink } from '@/data/site';
import { CATEGORIES_EN as CATEGORIES } from '@/data/categories';
import type { Locale } from '@/i18n/config';
import { localeHref } from '@/i18n/routing';
import { Brand } from './Brand';
import { InstagramIcon, TelegramIcon, WhatsAppIcon } from './icons';
import styles from './Footer.module.css';

interface Props {
  lang: Locale;
  /** home = company links column; destination = categories column. */
  variant?: 'home' | 'destination';
  tone?: 'dark' | 'light';
}

export function Footer({ lang, variant = 'destination', tone = 'dark' }: Props) {
  return (
    <footer id="contact" className={`${styles.footer} ${tone === 'light' ? styles.light : ''}`}>
      <div className="wrap">
        <div className={styles.top}>
          <div className={styles.brandCol}>
            <Brand lang={lang} tone={tone === 'light' ? 'dark' : 'light'} />
            <p>
              Excursions and day trips from Sharm El Sheikh — sea, desert and history. No prepayment, hotel transfer
              included.
            </p>
            <div className={styles.soc}>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <WhatsAppIcon />
              </a>
              {site.telegram && (
                <a href={site.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram">
                  <TelegramIcon />
                </a>
              )}
              {site.instagram && (
                <a href={site.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <InstagramIcon />
                </a>
              )}
            </div>
          </div>
          <div className={styles.col}>
            <h2>Destinations</h2>
            <Link href={localeHref(lang, '/sharm/')}>Sharm El Sheikh</Link>
            <p className={styles.dim}>Hurghada — soon</p>
            <p className={styles.dim}>Cairo — soon</p>
            <p className={styles.dim}>Marsa Alam — soon</p>
          </div>
          {variant === 'home' ? (
            <div className={styles.col}>
              <h2>Company</h2>
              <Link href={localeHref(lang, '/about-us/')}>About us</Link>
              <Link href={localeHref(lang, '/contact/')}>Contact form</Link>
              <Link href={localeHref(lang, '/sharm/video/')}>Videos</Link>
              <Link href={localeHref(lang, '/terms-and-conditions/')}>Terms &amp; Conditions</Link>
            </div>
          ) : (
            <div className={styles.col}>
              <h2>Categories</h2>
              {CATEGORIES.map((c) => (
                <Link key={c.key} href={localeHref(lang, `/sharm/?cat=${c.key}#tours`)}>
                  {c.label}
                </Link>
              ))}
            </div>
          )}
          <div className={styles.col}>
            <h2>Get in touch</h2>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
              {site.phoneDisplay || 'WhatsApp'}
            </a>
            {site.email && <a href={`mailto:${site.email}`}>{site.email}</a>}
            <Link href={localeHref(lang, '/contact/')}>Send us a message</Link>
          </div>
        </div>
        <div className={styles.bot}>
          <span>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </span>
          <Link href={localeHref(lang, '/terms-and-conditions/')} className={styles.terms}>
            Terms &amp; Conditions
          </Link>
        </div>
      </div>
    </footer>
  );
}
