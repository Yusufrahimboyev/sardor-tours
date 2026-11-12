import Link from 'next/link';
import { site } from '@/data/site';
import { href, PATHS, type Locale } from '@/i18n/config';
import type { Dict } from '@/i18n';
import type { Contacts } from '@/lib/server/settings';
import { ContactList } from './ContactList';
import s from './site.module.css';

export function SiteFooter({ locale, t, contacts }: { locale: Locale; t: Dict; contacts: Contacts }) {
  return (
    <footer className={s.footer}>
      <div className={`${s.wrap} ${s.footGrid}`}>
        <div>
          <h2>{site.name}</h2>
          <p>{t.meta.siteDescription}</p>
        </div>
        <nav aria-label={t.nav.menu}>
          <h2>{t.nav.menu}</h2>
          <Link href={href(locale, PATHS.tours)}>{t.nav.tours}</Link>
          <Link href={href(locale, PATHS.about)}>{t.nav.about}</Link>
          <Link href={href(locale, PATHS.guide)}>{t.nav.guide}</Link>
          <Link href={href(locale, PATHS.contacts)}>{t.nav.contacts}</Link>
        </nav>
        <div>
          <h2>{t.nav.contacts}</h2>
          <ContactList c={contacts} t={t.common} />
        </div>
      </div>
      <div className={`${s.wrap}`}>
        <div className={s.footBottom}>
          <span>
            © {new Date().getFullYear()} {site.name}. {t.footer.rights}
          </span>
          <Link href={href(locale, PATHS.terms)}>{t.footer.terms}</Link>
        </div>
      </div>
    </footer>
  );
}
