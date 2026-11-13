import { AdminI18nProvider } from './i18n/client';
import { getAdminLang } from './i18n/server';

/** Provides the admin interface language (cookie, default Uzbek) to client components. */
export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getAdminLang();
  return (
    <AdminI18nProvider lang={lang}>
      <div lang={lang}>{children}</div>
    </AdminI18nProvider>
  );
}
