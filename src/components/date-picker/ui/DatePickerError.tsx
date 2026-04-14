import styles from '../DatePicker.module.css';

import type { HTMLAttributes, ReactNode } from 'react';

interface DatePickerErrorProps extends HTMLAttributes<HTMLParagraphElement> {
  children?: ReactNode;
}

const joinClassName = (className: string | undefined): string =>
  [styles.error, className ?? ''].filter(Boolean).join(' ');

export default function DatePickerError({ children, className, ...rest }: DatePickerErrorProps) {
  if (children === null || children === undefined || children === '') {
    return null;
  }

  return (
    <p {...rest} className={joinClassName(className)}>
      {children}
    </p>
  );
}
