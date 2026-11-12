import { getSettings } from '@/lib/server/settings';
import { SettingsForm } from './SettingsForm';
import styles from '../../admin.module.css';

export const metadata = { title: 'Sozlamalar' };

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return (
    <>
      <h1 className={styles.h1}>Sozlamalar</h1>
      <p className={styles.muted}>Kontaktlar har bir til versiyasi uchun alohida — masalan, rus versiyasida boshqa telefon raqami ko‘rsatish mumkin.</p>
      <SettingsForm settings={settings} />
    </>
  );
}
