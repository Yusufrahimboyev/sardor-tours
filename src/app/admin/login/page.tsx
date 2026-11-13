import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { adminConfigured, isAdminSession } from '@/lib/server/auth';
import { site } from '@/data/site';
import { AdminLangSwitcher } from '../i18n/LangSwitcher';
import { getAdminDict, getAdminLang } from '../i18n/server';
import { LoginForm } from './LoginForm';
import styles from '../admin.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getAdminDict();
  return { title: t.meta.login, robots: { index: false, follow: false } };
}
export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  if (await isAdminSession()) redirect('/admin/');
  const [lang, t] = await Promise.all([getAdminLang(), getAdminDict()]);
  return (
    <main className={styles.loginWrap}>
      <div className={styles.loginCard}>
        <div className={styles.loginTop}>
          <div className={styles.loginBrand}>{site.name}</div>
          <AdminLangSwitcher lang={lang} label={t.langName} />
        </div>
        <h1>{t.login.title}</h1>
        {adminConfigured() ? (
          <LoginForm />
        ) : (
          <p className={styles.warn}>
            {t.login.disabledA} <code>.env.local</code> {t.login.disabledB} <code>ADMIN_PASSWORD</code> {t.login.disabledC}
          </p>
        )}
      </div>
    </main>
  );
}
