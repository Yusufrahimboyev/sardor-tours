'use client';

import { useId, useState } from 'react';
import { CheckIcon, XIcon } from '@/components/icons';
import styles from './tour.module.css';

interface Props {
  included: string[];
  notIncluded: string[];
  bring: string[];
}

const TABS = [
  { key: 'included', label: 'Included in the Price' },
  { key: 'excluded', label: 'Not Included' },
  { key: 'bring', label: 'What to Bring' },
] as const;

export function IncludedTabs({ included, notIncluded, bring }: Props) {
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('included');
  const id = useId();
  const lists = { included, excluded: notIncluded, bring };

  return (
    <div className={styles.inc}>
      <div role="tablist" aria-label="What's included" className={styles.incTabs}>
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            type="button"
            id={`${id}-${t.key}-tab`}
            aria-selected={tab === t.key}
            aria-controls={`${id}-${t.key}`}
            className={`${styles.incTab} ${styles[`tab_${t.key}`]} ${tab === t.key ? styles.incTabOn : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {TABS.map((t) => (
        <ul
          key={t.key}
          role="tabpanel"
          id={`${id}-${t.key}`}
          aria-labelledby={`${id}-${t.key}-tab`}
          hidden={tab !== t.key}
          className={`${styles.incList} ${styles[`list_${t.key}`]}`}
        >
          {lists[t.key].map((item) => (
            <li key={item}>
              {t.key === 'included' ? <CheckIcon size={15} /> : t.key === 'excluded' ? <XIcon size={15} /> : <i aria-hidden />}
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}
