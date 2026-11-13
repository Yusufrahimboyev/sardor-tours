'use client';

import { createContext, useContext } from 'react';
import { DEFAULT_ADMIN_LANG, type AdminLang } from './config';
import { ADMIN_DICTS, type AdminDict } from './dict';

const AdminLangContext = createContext<AdminLang>(DEFAULT_ADMIN_LANG);

export function AdminI18nProvider({ lang, children }: { lang: AdminLang; children: React.ReactNode }) {
  return <AdminLangContext.Provider value={lang}>{children}</AdminLangContext.Provider>;
}

export function useAdminLang(): AdminLang {
  return useContext(AdminLangContext);
}

export function useAdminDict(): AdminDict {
  return ADMIN_DICTS[useContext(AdminLangContext)];
}
