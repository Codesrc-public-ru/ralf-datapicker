import styles from '../DatePicker.module.css';

import type { DatePickerDialogProps } from '../types/internal.types';

const joinClassName = (className: string | undefined): string =>
  [styles.dialog, className ?? ''].filter(Boolean).join(' ');

export default function DatePickerDialog({
  children,
  className,
  open = true,
  ...rest
}: DatePickerDialogProps) {
  return (
    <div
      {...rest}
      aria-modal="true"
      className={joinClassName(className)}
      hidden={!open}
      role="dialog"
    >
      {children}
    </div>
  );
}
