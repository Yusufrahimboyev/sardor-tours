import { getSettings } from '@/lib/server/settings';
import { SettingsForm } from './SettingsForm';
import { getAdminDict } from '../../i18n/server';
import styles from '../../admin.module.css';

export async function generateMetadata() {
  return { title: (await getAdminDict()).settings.title };
}

export default async function AdminSettingsPage() {
  const [settings, t] = await Promise.all([getSettings(), getAdminDict()]);
  return (
    <>
      <h1 className={styles.h1}>{t.settings.title}</h1>
      <p className={styles.muted}>{t.settings.intro}</p>
      <SettingsForm settings={settings} />
    </>
  );
}
