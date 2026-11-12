import { CheckIcon, XIcon } from '@/components/icons';
import styles from './tour.module.css';

interface Props {
  included: string[];
  notIncluded: string[];
  bring: string[];
}

/** Stacked "Included / Not included / What to bring" panels under the itinerary. */
export function IncludedBoxes({ included, notIncluded, bring }: Props) {
  const boxes = [
    { key: 'inc', title: 'Included in the Price', items: included, icon: <CheckIcon size={16} /> },
    { key: 'exc', title: 'Not Included', items: notIncluded, icon: <XIcon size={16} /> },
    { key: 'bring', title: 'What to Bring', items: bring, icon: <i aria-hidden /> },
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
