import styles from '../DatePicker.module.css';

import type { HTMLAttributes, ReactNode } from 'react';

interface CalendarHeaderProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  label: ReactNode;
}

const joinClassName = (className: string | undefined): string =>
  [styles.header, className ?? ''].filter(Boolean).join(' ');

export default function CalendarHeader({
  children,
  className,
  label,
  ...rest
}: CalendarHeaderProps) {
  return (
    <header {...rest} className={joinClassName(className)}>
      <div className={styles.headerLabel}>{label}</div>
      {children ? <div className={styles.headerActions}>{children}</div> : null}
    </header>
  );
}
