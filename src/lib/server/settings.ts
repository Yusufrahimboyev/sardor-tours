import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { site } from '@/data/site';
import { LOCALES, type Locale } from '@/i18n/config';
import { atomicWrite, withFileLock } from './fileStore';

/**
 * Site settings editable in the admin panel (Settings page): contacts per language
 * and the home-page video. Stored in DATA_DIR/settings.json; defaults come from
 * src/data/site.ts and NEXT_PUBLIC_* env vars.
 */
export interface Contacts {
  phoneDisplay: string;
  /** Digits only, with country code — used for wa.me links. */
  whatsapp: string;
  email: string;
  telegram: string;
  instagram: string;
  address: string;
}

export interface Settings {
  contacts: Record<Locale, Contacts>;
  /** Home "video presentation" — a /media/… upload, /videos/… file or https URL. */
  video: string;
}

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), '.data');
const FILE = path.join(DATA_DIR, 'settings.json');

function defaults(): Settings {
  const c: Contacts = {
    phoneDisplay: site.phoneDisplay,
    whatsapp: site.whatsappNumber,
    email: site.email,
    telegram: site.telegram,
    instagram: site.instagram,
    address: '',
  };
  return {
    contacts: Object.fromEntries(LOCALES.map((l) => [l, { ...c }])) as Record<Locale, Contacts>,
    video: process.env.NEXT_PUBLIC_HERO_VIDEO || '/videos/hero.mp4',
  };
}

export async function getSettings(): Promise<Settings> {
  const d = defaults();
  try {
    const saved = JSON.parse(await fs.readFile(FILE, 'utf8')) as Partial<Settings>;
    return {
      video: saved.video ?? d.video,
      contacts: Object.fromEntries(LOCALES.map((l) => [l, { ...d.contacts[l], ...saved.contacts?.[l] }])) as Record<Locale, Contacts>,
    };
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return d;
    throw e;
  }
}

export function saveSettings(s: Settings): Promise<void> {
  return withFileLock(FILE, () => atomicWrite(FILE, JSON.stringify(s, null, 2)));
}

export async function getContacts(locale: Locale): Promise<Contacts> {
  return (await getSettings()).contacts[locale];
}

export function waLink(c: Pick<Contacts, 'whatsapp'>, text?: string): string {
  const base = `https://wa.me/${c.whatsapp.replace(/\D/g, '')}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
