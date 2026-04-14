import styles from '../DatePicker.module.css';

import type { DatePickerFieldProps } from '../types/internal.types';

const joinClassName = (className: string | undefined, invalid: boolean): string =>
  [styles.field, invalid ? styles.invalid : '', className ?? ''].filter(Boolean).join(' ');

export default function DatePickerField({
  children,
  className,
  invalid = false,
  ...rest
}: DatePickerFieldProps) {
  return (
    <div
      {...rest}
      className={joinClassName(className, invalid)}
      data-invalid={invalid || undefined}
    >
      {children}
    </div>
  );
}
