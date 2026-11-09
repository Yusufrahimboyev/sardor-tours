'use client';

import { createContext, useContext, useMemo } from 'react';
import type { Locale } from './config';
import type { Messages } from './messages';
import { createT, type Dict, type T } from './translate';

interface Ctx {
  lang: Locale;
  t: T;
}

const I18nCtx = createContext<Ctx | null>(null);

/** Supplies the `client` message namespace and the current locale to client components. */
export function I18nProvider({
  lang,
  messages,
  children,
}: {
  lang: Locale;
  messages: Messages['client'];
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({ lang, t: createT(messages as unknown as Dict, lang) }), [lang, messages]);
  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

function useI18n(): Ctx {
  const v = useContext(I18nCtx);
  if (!v) throw new Error('useT/useLang must be used inside <I18nProvider>');
  return v;
}

/** Translator for the `client` namespace: `t('nav.home')` reads `client.nav.home`. */
export function useT(): T {
  return useI18n().t;
}

export function useLang(): Locale {
  return useI18n().lang;
}
