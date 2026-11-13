import 'server-only';
import { cookies } from 'next/headers';
import { ADMIN_LANG_COOKIE, DEFAULT_ADMIN_LANG, isAdminLang, type AdminLang } from './config';
import { ADMIN_DICTS, type AdminDict } from './dict';

export async function getAdminLang(): Promise<AdminLang> {
  const v = (await cookies()).get(ADMIN_LANG_COOKIE)?.value;
  return isAdminLang(v) ? v : DEFAULT_ADMIN_LANG;
}

export async function getAdminDict(): Promise<AdminDict> {
  return ADMIN_DICTS[await getAdminLang()];
}
