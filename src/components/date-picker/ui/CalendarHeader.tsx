import styles from '../DatePicker.module.css';

import type { CalendarHeaderProps } from '../types/internal.types';

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
