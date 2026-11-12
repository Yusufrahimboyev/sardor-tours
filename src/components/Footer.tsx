import Link from 'next/link';
import { site, whatsappLink } from '@/data/site';
import { CATEGORIES } from '@/data/tours';
import { Brand } from './Brand';
import { InstagramIcon, TelegramIcon, WhatsAppIcon } from './icons';
import styles from './Footer.module.css';

interface Props {
  /** home = company links column; destination = categories column. */
  variant?: 'home' | 'destination';
  tone?: 'dark' | 'light';
  /** Show the small travellers / rating / since figures row (tour pages). */
  stats?: boolean;
}

function shortCount(v: string) {
  const n = parseInt(v.replace(/\D/g, ''), 10) || 0;
  return n >= 1000 ? `${Math.round(n / 1000)}K+` : v;
}

export function Footer({ variant = 'destination', tone = 'dark', stats }: Props) {
  return (
    <footer
      id="contact"
      className={`${styles.footer} ${tone === 'light' ? styles.light : variant === 'destination' ? styles.navy : ''}`}
    >
      <div className="wrap">
        <div className={styles.top}>
          <div className={styles.brandCol}>
            <Brand tone={tone === 'light' ? 'dark' : 'light'} />
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
            <Link href="/en/sharm/">Sharm El Sheikh</Link>
            <p>Hurghada</p>
            <p>Cairo</p>
            <p>Marsa Alam</p>
          </div>
          {variant === 'home' ? (
            <div className={styles.col}>
              <h2>Company</h2>
              <Link href="/en/about-us/">About us</Link>
              <Link href="/en/contact/">Contact form</Link>
              <Link href="/en/sharm/video/">Videos</Link>
              <Link href="/en/terms-and-conditions/">Terms &amp; Conditions</Link>
            </div>
          ) : (
            <div className={styles.col}>
              <h2>Categories</h2>
              {CATEGORIES.map((c) => (
                <Link key={c.key} href={`/en/sharm/?cat=${c.key}#tours`}>
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
            {site.offices.length > 0 ? (
              site.offices.map((o) => <p key={o}>{o}</p>)
            ) : (
              <Link href="/en/contact/">Send us a message</Link>
            )}
          </div>
        </div>
        {stats && (
          <div className={styles.statsWrap}>
            <div className={styles.stats}>
              <div>
                <b>{shortCount(site.stats.travellers)}</b>
                <span>travellers</span>
              </div>
              <i aria-hidden />
              <div>
                <b>{site.stats.rating}★</b>
                <span>rating</span>
              </div>
              <i aria-hidden />
              <div>
                <b>{site.since || site.stats.years}</b>
                <span>{site.since ? 'since' : 'years'}</span>
              </div>
            </div>
          </div>
        )}
        <div className={styles.bot}>
          <span>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </span>
          <Link href="/en/terms-and-conditions/" className={styles.terms}>
            Terms &amp; Conditions
          </Link>
        </div>
      </div>
    </footer>
  );
}
