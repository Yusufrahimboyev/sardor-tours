import { PLAN_TRIP_MSG, whatsappLink } from '@/data/site';
import { WhatsAppIcon } from './icons';
import styles from './CtaBand.module.css';

export function CtaBand() {
  return (
    <section className={styles.cta} aria-labelledby="cta-title">
      <div className={`wrap reveal ${styles.inner}`}>
        <h2 id="cta-title">Ready to discover Egypt?</h2>
        <p>
          Tell us your dates and what you love — we&apos;ll build the perfect trip for your group and budget. Reply in
          minutes, no prepayment.
        </p>
        <a href={whatsappLink(PLAN_TRIP_MSG)} target="_blank" rel="noopener noreferrer" className={styles.btn}>
          <WhatsAppIcon size={20} />
          Plan my trip on WhatsApp
        </a>
      </div>
    </section>
  );
}
