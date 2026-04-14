import styles from '../DatePicker.module.css';

import type { CalendarGridProps } from '../types/internal.types';

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
