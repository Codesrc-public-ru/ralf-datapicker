import { isDateInRange } from './isDateInRange';
import { isSameDay } from './isSameDay';
import { normalizeDate } from './normalizeDate';

import type { DatePickerDisabledDates } from '../../types/public.types';

interface DateDisabledOptions {
  minDate?: Date | null;
  maxDate?: Date | null;
  disabledDates?: DatePickerDisabledDates | null;
}

const isDisabledDatesPredicate = (
  disabledDates: DatePickerDisabledDates
): disabledDates is (date: Date) => boolean => typeof disabledDates === 'function';

export const isDateDisabled = (
  date: Date,
  options: DateDisabledOptions = {}
): boolean => {
  const normalizedDate = normalizeDate(date);

  if (!isDateInRange(normalizedDate, options.minDate, options.maxDate)) {
    return true;
  }

  const { disabledDates } = options;

  if (!disabledDates) {
    return false;
  }

  if (isDisabledDatesPredicate(disabledDates)) {
    return disabledDates(normalizedDate);
  }

  return disabledDates.some((disabledDate) => isSameDay(normalizedDate, disabledDate));
};
