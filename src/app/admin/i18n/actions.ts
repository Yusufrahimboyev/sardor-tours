'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { ADMIN_LANG_COOKIE, isAdminLang } from './config';

export async function setAdminLangAction(lang: string): Promise<void> {
  if (!isAdminLang(lang)) return;
  (await cookies()).set(ADMIN_LANG_COOKIE, lang, {
    path: '/',
    maxAge: 365 * 86_400,
    sameSite: 'lax',
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
  });
  revalidatePath('/admin', 'layout');
}
