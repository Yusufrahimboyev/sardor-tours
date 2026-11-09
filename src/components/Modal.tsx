'use client';

import { useEffect, useRef } from 'react';
import { useT } from '@/i18n/client';
import { XIcon } from './icons';
import styles from './Modal.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
  /** sheet = bottom sheet on mobile, centered card on desktop. */
  variant?: 'card' | 'sheet' | 'panel';
  hideClose?: boolean;
  className?: string;
}

/** Accessible modal built on the native <dialog> (focus trap + Esc for free). */
export function Modal({ open, onClose, label, children, variant = 'card', hideClose, className }: Props) {
  const t = useT();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      document.documentElement.classList.add('locked');
    } else if (!open && d.open) {
      d.close();
    }
    if (!open) document.documentElement.classList.remove('locked');
  }, [open]);

  useEffect(() => () => document.documentElement.classList.remove('locked'), []);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      className={`${styles.dialog} ${styles[variant]} ${className ?? ''}`}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.box}>
        {!hideClose && (
          <button type="button" className={styles.close} onClick={onClose} aria-label={t('common.close')}>
            <XIcon size={18} />
          </button>
        )}
        {open && children}
      </div>
    </dialog>
  );
}
