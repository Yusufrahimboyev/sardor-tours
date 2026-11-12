import Link from 'next/link';
import { site, whatsappLink } from '@/data/site';
import { categoryList } from '@/data/categories';
import type { Locale } from '@/i18n/config';
import { getT } from '@/i18n/messages';
import { localeHref } from '@/i18n/routing';
import { Brand } from './Brand';
import { InstagramIcon, TelegramIcon, WhatsAppIcon } from './icons';
import styles from './Footer.module.css';

interface Props {
  lang: Locale;
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

export function Footer({ lang, variant = 'destination', tone = 'dark', stats }: Props) {
  const t = getT(lang);
  return (
    <footer
      id="contact"
      className={`${styles.footer} ${tone === 'light' ? styles.light : variant === 'destination' ? styles.navy : ''}`}
    >
      <div className="wrap">
        <div className={styles.top}>
          <div className={styles.brandCol}>
            <Brand tone={tone === 'light' ? 'dark' : 'light'} />
            <p>{t('common.footer.blurb')}</p>
            <div className={styles.soc}>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" aria-label={t('common.footer.whatsapp')}>
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
            <h2>{t('common.footer.destinations')}</h2>
            <Link href={localeHref(lang, '/sharm/')}>{t('common.footer.sharm')}</Link>
            <p className={styles.dim}>{t('common.footer.hurghada')}</p>
            <p className={styles.dim}>{t('common.footer.cairo')}</p>
            <p className={styles.dim}>{t('common.footer.marsaAlam')}</p>
          </div>
          {variant === 'home' ? (
            <div className={styles.col}>
              <h2>{t('common.footer.company')}</h2>
              <Link href={localeHref(lang, '/about-us/')}>{t('nav.aboutUs')}</Link>
              <Link href={localeHref(lang, '/contact/')}>{t('nav.contactForm')}</Link>
              <Link href={localeHref(lang, '/sharm/video/')}>{t('nav.videos')}</Link>
              <Link href={localeHref(lang, '/terms-and-conditions/')}>{t('nav.terms')}</Link>
            </div>
          ) : (
            <div className={styles.col}>
              <h2>{t('common.footer.categories')}</h2>
              {categoryList(t).map((c) => (
                <Link key={c.key} href={localeHref(lang, `/sharm/?cat=${c.key}#tours`)}>
                  {c.label}
                </Link>
              ))}
            </div>
          )}
          <div className={styles.col}>
            <h2>{t('common.footer.getInTouch')}</h2>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
              {site.phoneDisplay || t('common.footer.whatsapp')}
            </a>
            {site.email && <a href={`mailto:${site.email}`}>{site.email}</a>}
            <Link href={localeHref(lang, '/contact/')}>{t('common.footer.sendMessage')}</Link>
          </div>
        </div>
        {stats && (
          <div className={styles.statsWrap}>
            <div className={styles.stats}>
              <div>
                <b>{shortCount(site.stats.travellers)}</b>
                <span>{t('common.footer.travellers')}</span>
              </div>
              <i aria-hidden />
              <div>
                <b>{site.stats.rating}★</b>
                <span>{t('common.footer.rating')}</span>
              </div>
              <i aria-hidden />
              <div>
                <b>{site.since || site.stats.years}</b>
                <span>{t(site.since ? 'common.footer.since' : 'common.footer.years')}</span>
              </div>
            </div>
          </div>
        )}
        <div className={styles.bot}>
          <span>{t('common.footer.rights', { year: new Date().getFullYear(), name: site.name })}</span>
          <Link href={localeHref(lang, '/terms-and-conditions/')} className={styles.terms}>
            {t('nav.terms')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
