import { useCallback } from 'react';

import { getLiveRegionMessage } from '../lib/a11y/getLiveRegionMessage';
import { isDateDisabled } from '../lib/date/isDateDisabled';
import { normalizeDate } from '../lib/date/normalizeDate';
import { formatFullDateLabel } from '../lib/i18n/formatFullDateLabel';

import type { DateSelectionOptions } from '../types/internal.types';

export const selectDate = (date: Date, options: DateSelectionOptions): boolean => {
  if (isDateDisabled(date, options)) {
    return false;
  }

  const normalizedDate = normalizeDate(date);

  options.onChange(normalizedDate);
  options.closeDialog();
  options.setLiveRegionMessage(
    getLiveRegionMessage(formatFullDateLabel(normalizedDate, options.locale), 'selected')
  );

  return true;
};

export default function useDatePickerSelection(options: DateSelectionOptions): {
  handleDaySelect: (date: Date) => boolean;
} {
  const { closeDialog, disabledDates, locale, maxDate, minDate, onChange, setLiveRegionMessage } =
    options;
  const handleDaySelect = useCallback(
    (date: Date) =>
      selectDate(date, {
        closeDialog,
        disabledDates,
        locale,
        maxDate,
        minDate,
        onChange,
        setLiveRegionMessage
      }),
    [closeDialog, disabledDates, locale, maxDate, minDate, onChange, setLiveRegionMessage]
  );

  return {
    handleDaySelect
  };
}
