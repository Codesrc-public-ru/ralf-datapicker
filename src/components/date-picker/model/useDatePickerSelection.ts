import { useCallback } from 'react';

import { isDateDisabled } from '../lib/date/isDateDisabled';
import { normalizeDate } from '../lib/date/normalizeDate';

import type { DatePickerProps } from '../types/public.types';

interface DateSelectionOptions {
  closeDialog: () => void;
  disabledDates?: DatePickerProps['disabledDates'];
  maxDate?: DatePickerProps['maxDate'];
  minDate?: DatePickerProps['minDate'];
  onChange: DatePickerProps['onChange'];
}

export const selectDate = (date: Date, options: DateSelectionOptions): boolean => {
  if (isDateDisabled(date, options)) {
    return false;
  }

  options.onChange(normalizeDate(date));
  options.closeDialog();

  return true;
};

export default function useDatePickerSelection(options: DateSelectionOptions): {
  handleDaySelect: (date: Date) => boolean;
} {
  const { closeDialog, disabledDates, maxDate, minDate, onChange } = options;
  const handleDaySelect = useCallback(
    (date: Date) =>
      selectDate(date, {
        closeDialog,
        disabledDates,
        maxDate,
        minDate,
        onChange
      }),
    [closeDialog, disabledDates, maxDate, minDate, onChange]
  );

  return {
    handleDaySelect
  };
}
