import { whatsappLink } from '@/data/site';
import type { Locale } from '@/i18n/config';
import { getT } from '@/i18n/messages';
import { WhatsAppIcon } from './icons';
import styles from './CtaBand.module.css';

export function CtaBand({ lang }: { lang: Locale }) {
  const t = getT(lang);
  return (
    <section className={styles.cta} aria-labelledby="cta-title">
      <div className={`wrap reveal ${styles.inner}`}>
        <h2 id="cta-title">{t('common.cta.title')}</h2>
        <p>{t('common.cta.text')}</p>
        <a href={whatsappLink(t('client.whatsapp.planTrip'))} target="_blank" rel="noopener noreferrer" className={styles.btn}>
          <WhatsAppIcon size={20} />
          {t('common.cta.button')}
        </a>
      </div>
    </section>
  );
}
