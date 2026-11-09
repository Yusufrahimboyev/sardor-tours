import 'server-only';
import type { Locale } from './config';
import en from './messages/en.json';
import uzJson from './messages/uz.json';
import ruJson from './messages/ru.json';
import { createT, type Dict, type T } from './translate';

export type Messages = typeof en;

const uz = uzJson satisfies Messages;
const ru = ruJson satisfies Messages;

const ALL: Record<Locale, Messages> = { en, uz, ru };

export function getMessages(lang: Locale): Messages {
  return ALL[lang];
}

const cache = new Map<Locale, T>();

/** Translator for server components (keys are full paths, e.g. `common.footer.blurb`). */
export function getT(lang: Locale): T {
  let t = cache.get(lang);
  if (!t) {
    t = createT(ALL[lang] as unknown as Dict, lang);
    cache.set(lang, t);
  }
  return t;
}
