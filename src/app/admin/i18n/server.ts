import 'server-only';
import { cookies } from 'next/headers';
import { ADMIN_LANG_COOKIE, ADMIN_THEME_COOKIE, DEFAULT_ADMIN_LANG, isAdminLang, isAdminTheme, type AdminLang, type AdminTheme } from './config';
import { ADMIN_DICTS, type AdminDict } from './dict';

export async function getAdminLang(): Promise<AdminLang> {
  const v = (await cookies()).get(ADMIN_LANG_COOKIE)?.value;
  return isAdminLang(v) ? v : DEFAULT_ADMIN_LANG;
}

export async function getAdminDict(): Promise<AdminDict> {
  return ADMIN_DICTS[await getAdminLang()];
}

export async function getAdminTheme(): Promise<AdminTheme> {
  const v = (await cookies()).get(ADMIN_THEME_COOKIE)?.value;
  return isAdminTheme(v) ? v : 'light';
}
