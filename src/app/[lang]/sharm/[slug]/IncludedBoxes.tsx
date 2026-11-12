import { CheckIcon, XIcon } from '@/components/icons';
import type { Locale } from '@/i18n/config';
import { getT } from '@/i18n/messages';
import styles from './tour.module.css';

interface Props {
  lang: Locale;
  included: string[];
  notIncluded: string[];
  bring: string[];
}

/** Stacked "Included / Not included / What to bring" panels under the itinerary. */
export function IncludedBoxes({ lang, included, notIncluded, bring }: Props) {
  const t = getT(lang);
  const boxes = [
    { key: 'inc', title: t('client.included.included'), items: included, icon: <CheckIcon size={16} /> },
    { key: 'exc', title: t('client.included.excluded'), items: notIncluded, icon: <XIcon size={16} /> },
    { key: 'bring', title: t('client.included.bring'), items: bring, icon: <i aria-hidden /> },
  ].filter((b) => b.items.length > 0);

  return (
    <div className={styles.incWrap}>
      {boxes.map((b) => (
        <section key={b.key} className={`${styles.incBox} ${styles[`inc_${b.key}`]}`} aria-label={b.title}>
          <h3 className={styles.incPill}>{b.title}</h3>
          <ul>
            {b.items.map((item) => (
              <li key={item}>
                {b.icon}
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
