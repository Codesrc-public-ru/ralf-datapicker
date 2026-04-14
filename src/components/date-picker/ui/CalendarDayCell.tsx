import styles from '../DatePicker.module.css';

import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

interface CalendarDayCellProps extends HTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
  dayButtonProps: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;
  focused?: boolean;
  outsideMonth?: boolean;
  selected?: boolean;
  unavailable?: boolean;
}

const joinClassName = (className: string | undefined, stateClassNames: string[]): string =>
  [styles.cell, ...stateClassNames, className ?? ''].filter(Boolean).join(' ');

const joinButtonClassName = (className: string | undefined, stateClassNames: string[]): string =>
  [styles.dayButton, ...stateClassNames, className ?? ''].filter(Boolean).join(' ');

export default function CalendarDayCell({
  children,
  className,
  dayButtonProps,
  focused = false,
  outsideMonth = false,
  selected = false,
  unavailable = false,
  ...rest
}: CalendarDayCellProps) {
  const cellStateClassNames = [];
  const buttonStateClassNames = [];

  if (focused) {
    buttonStateClassNames.push(styles.focused);
  }

  if (selected) {
    buttonStateClassNames.push(styles.selected);
  }

  if (unavailable) {
    cellStateClassNames.push(styles.disabled);
    buttonStateClassNames.push(styles.disabled);
  }

  if (outsideMonth) {
    cellStateClassNames.push(styles.outsideMonth);
    buttonStateClassNames.push(styles.outsideMonth);
  }

  return (
    <td
      {...rest}
      aria-selected={selected || undefined}
      className={joinClassName(className, cellStateClassNames)}
      data-focused={focused || undefined}
      data-outside-month={outsideMonth || undefined}
      data-selected={selected || undefined}
      data-unavailable={unavailable || undefined}
      role="gridcell"
    >
      <button
        {...dayButtonProps}
        className={joinButtonClassName(dayButtonProps.className, buttonStateClassNames)}
        disabled={dayButtonProps.disabled ?? unavailable}
        type={dayButtonProps.type ?? 'button'}
      >
        {children}
      </button>
    </td>
  );
}
