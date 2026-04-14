import styles from '../DatePicker.module.css';

import type { TableHTMLAttributes, ReactNode } from 'react';

interface CalendarGridProps extends TableHTMLAttributes<HTMLTableElement> {
  children: ReactNode;
  caption?: ReactNode;
}

const joinClassName = (className: string | undefined): string =>
  [styles.grid, className ?? ''].filter(Boolean).join(' ');

export default function CalendarGrid({
  caption,
  children,
  className,
  ...rest
}: CalendarGridProps) {
  return (
    <table {...rest} className={joinClassName(className)} role="grid">
      {caption ? <caption className={styles.gridCaption}>{caption}</caption> : null}
      {children}
    </table>
  );
}
