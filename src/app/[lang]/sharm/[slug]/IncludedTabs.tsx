'use client';

import { useId, useState } from 'react';
import { useT } from '@/i18n/client';
import { CheckIcon, XIcon } from '@/components/icons';
import styles from './tour.module.css';

interface Props {
  included: string[];
  notIncluded: string[];
  bring: string[];
}

const TABS = [{ key: 'included' }, { key: 'excluded' }, { key: 'bring' }] as const;

export function IncludedTabs({ included, notIncluded, bring }: Props) {
  const t = useT();
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('included');
  const id = useId();
  const lists = { included, excluded: notIncluded, bring };

  return (
    <div className={styles.inc}>
      <div role="tablist" aria-label={t('included.aria')} className={styles.incTabs}>
        {TABS.map((tb) => (
          <button
            key={tb.key}
            role="tab"
            type="button"
            id={`${id}-${tb.key}-tab`}
            aria-selected={tab === tb.key}
            aria-controls={`${id}-${tb.key}`}
            className={`${styles.incTab} ${styles[`tab_${tb.key}`]} ${tab === tb.key ? styles.incTabOn : ''}`}
            onClick={() => setTab(tb.key)}
          >
            {t(`included.${tb.key}`)}
          </button>
        ))}
      </div>
      {TABS.map((tb) => (
        <ul
          key={tb.key}
          role="tabpanel"
          id={`${id}-${tb.key}`}
          aria-labelledby={`${id}-${tb.key}-tab`}
          hidden={tab !== tb.key}
          className={`${styles.incList} ${styles[`list_${tb.key}`]}`}
        >
          {lists[tb.key].map((item) => (
            <li key={item}>
              {tb.key === 'included' ? <CheckIcon size={15} /> : tb.key === 'excluded' ? <XIcon size={15} /> : <i aria-hidden />}
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}
