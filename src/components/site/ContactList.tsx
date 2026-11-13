import type { Dict } from '@/i18n';
import { waLink, type Contacts } from '@/lib/server/settings';
import s from './site.module.css';

/** Contact details for the current language (set in Admin → Sozlamalar). Empty fields are hidden. */
export function ContactList({ c, t }: { c: Contacts; t: Dict['common'] }) {
  const rows = [
    c.phoneDisplay && [t.phone, <a key="p" href={`tel:${c.phoneDisplay.replace(/[^\d+]/g, '')}`}>{c.phoneDisplay}</a>],
    c.whatsapp && [t.whatsapp, <a key="w" href={waLink(c)} target="_blank" rel="noopener noreferrer">{c.phoneDisplay || `+${c.whatsapp}`}</a>],
    c.telegram && [t.telegram, <a key="t" href={c.telegram} target="_blank" rel="noopener noreferrer">{c.telegram.replace(/^https?:\/\/(t\.me\/)?/, '@')}</a>],
    c.email && [t.email, <a key="e" href={`mailto:${c.email}`}>{c.email}</a>],
    c.instagram && ['Instagram', <a key="i" href={c.instagram} target="_blank" rel="noopener noreferrer">{c.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\/?/, '@').replace(/\/$/, '')}</a>],
    c.address && [t.address, <span key="a">{c.address}</span>],
  ].filter(Boolean) as [string, React.ReactNode][];

  return (
    <ul className={s.contactList}>
      {rows.map(([label, value]) => (
        <li key={label}>
          <span className={s.cLabel}>{label}</span>
          {value}
        </li>
      ))}
    </ul>
  );
}
