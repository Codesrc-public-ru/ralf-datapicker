import styles from '../DatePicker.module.css';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface DatePickerTriggerProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode;
}

const joinClassName = (className: string | undefined): string =>
  [styles.trigger, className ?? ''].filter(Boolean).join(' ');

export default function DatePickerTrigger({
  children,
  className,
  type = 'button',
  ...rest
}: DatePickerTriggerProps) {
  return (
    <button {...rest} className={joinClassName(className)} type={type}>
      {children}
    </button>
  );
}
