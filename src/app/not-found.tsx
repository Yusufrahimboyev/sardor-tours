import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import styles from './en/legal.module.css';

export default function NotFound() {
  return (
    <div className={styles.page}>
      <SiteHeader />
      <main id="main-content" className={styles.main} style={{ textAlign: 'center', minHeight: '70vh' }}>
        <div className={styles.intro}>
          <div className={styles.updated}>404</div>
          <h1 style={{ marginTop: 14 }}>This page sailed away</h1>
          <p>The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        </div>
        <div className={styles.askBtns} style={{ marginTop: 26 }}>
          <Link href="/en/sharm/" className={styles.btn} style={{ background: 'var(--orange)', color: '#fff' }}>
            Browse excursions
          </Link>
          <Link href="/" className={styles.btn}>
            Home
          </Link>
        </div>
      </main>
    </div>
  );
}
