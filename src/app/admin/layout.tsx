import { AdminI18nProvider } from './i18n/client';
import { getAdminLang, getAdminTheme } from './i18n/server';

/** Provides the admin interface language (cookie, default Uzbek) and colour theme (cookie, default light). */
export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const [lang, theme] = await Promise.all([getAdminLang(), getAdminTheme()]);
  return (
    <AdminI18nProvider lang={lang}>
      <div lang={lang} data-admin-theme={theme}>{children}</div>
    </AdminI18nProvider>
  );
}
