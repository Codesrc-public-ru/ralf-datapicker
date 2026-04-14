import styles from '../DatePicker.module.css';

import type { HTMLAttributes, ReactNode } from 'react';

interface CalendarWeekdaysProps extends HTMLAttributes<HTMLTableSectionElement> {
  weekdayLabels: readonly ReactNode[];
}

const joinClassName = (className: string | undefined): string =>
  [styles.weekdays, className ?? ''].filter(Boolean).join(' ');

export default function CalendarWeekdays({
  className,
  weekdayLabels,
  ...rest
}: CalendarWeekdaysProps) {
  return (
    <thead {...rest} className={joinClassName(className)}>
      <tr>
        {weekdayLabels.map((weekdayLabel, index) => (
          <th key={`${String(weekdayLabel)}-${index}`} className={styles.weekday} scope="col">
            {weekdayLabel}
          </th>
        ))}
      </tr>
    </thead>
  );
}
