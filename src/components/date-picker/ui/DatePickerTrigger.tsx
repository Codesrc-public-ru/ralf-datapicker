import { forwardRef } from 'react';

import styles from '../DatePicker.module.css';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface DatePickerTriggerProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode;
}

const joinClassName = (className: string | undefined): string =>
  [styles.trigger, className ?? ''].filter(Boolean).join(' ');

const DatePickerTrigger = forwardRef<HTMLButtonElement, DatePickerTriggerProps>(function DatePickerTrigger(
  { children, className, type = 'button', ...rest },
  ref
) {
  return (
    <button ref={ref} {...rest} className={joinClassName(className)} type={type}>
      {children}
    </button>
  );
});

export default DatePickerTrigger;
