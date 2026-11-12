import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { adminConfigured, isAdminSession } from '@/lib/server/auth';
import { site } from '@/data/site';
import { LoginForm } from './LoginForm';
import styles from '../admin.module.css';

export const metadata: Metadata = { title: 'Admin login', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  if (await isAdminSession()) redirect('/admin/');
  return (
    <main className={styles.loginWrap}>
      <div className={styles.loginCard}>
        <div className={styles.loginBrand}>{site.name}</div>
        <h1>Admin panelga kirish</h1>
        {adminConfigured() ? (
          <LoginForm />
        ) : (
          <p className={styles.warn}>
            Admin panel o‘chirilgan. <code>.env.local</code> faylida (yoki hosting sozlamalarida) <code>ADMIN_PASSWORD</code>{' '}
            parolini yozing va serverni qayta ishga tushiring.
          </p>
        )}
      </div>
    </main>
  );
}
