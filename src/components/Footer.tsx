import Link from 'next/link';
import { site, whatsappLink } from '@/data/site';
import { CATEGORIES } from '@/data/tours';
import { Brand } from './Brand';
import { InstagramIcon, TelegramIcon, WhatsAppIcon } from './icons';
import styles from './Footer.module.css';

interface Props {
  /** home = destinations + languages columns; destination = categories column + stats. */
  variant?: 'home' | 'destination';
  tone?: 'dark' | 'light';
}

export function Footer({ variant = 'destination', tone = 'dark' }: Props) {
  return (
    <footer id="contact" className={`${styles.footer} ${tone === 'light' ? styles.light : ''}`}>
      <div className="wrap">
        <div className={styles.top}>
          <div className={styles.brandCol}>
            <Brand tone={tone === 'light' ? 'dark' : 'light'} />
            <p>
              Egypt&apos;s most trusted local tour operator. Excursions across Sharm El Sheikh, Hurghada, Cairo and Marsa
              Alam.
            </p>
            <div className={styles.soc}>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <WhatsAppIcon />
              </a>
              <a href={site.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram">
                <TelegramIcon />
              </a>
              <a href={site.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <InstagramIcon />
              </a>
            </div>
          </div>
          <div className={styles.col}>
            <h2>Destinations</h2>
            <Link href="/en/sharm/">Sharm El Sheikh</Link>
            <p className={styles.dim}>Hurghada — soon</p>
            <p className={styles.dim}>Cairo — soon</p>
            <p className={styles.dim}>Marsa Alam — soon</p>
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
              {site.phoneDisplay}
            </a>
            <a href={`mailto:${site.email}`}>{site.email}</a>
            <Link href="/en/contact/">Send us a message</Link>
            <p>Old Market &amp; Dahab Mall, Sharm El Sheikh</p>
            <p>Dokki, Giza — Cairo</p>
          </div>
        </div>
        {variant === 'destination' && (
          <div className={styles.stats}>
            <div>
              <b>150K+</b>
              <span>travellers</span>
            </div>
            <i />
            <div>
              <b>{site.stats.rating}★</b>
              <span>rating</span>
            </div>
            <i />
            <div>
              <b>{site.stats.founded}</b>
              <span>since</span>
            </div>
          </div>
        )}
        <div className={styles.bot}>
          <span>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </span>
          <span>Family-run in Egypt since 2009 · Licensed tour operator</span>
          <Link href="/en/terms-and-conditions/" className={styles.terms}>
            Terms &amp; Conditions
          </Link>
        </div>
      </div>
    </footer>
  );
}
