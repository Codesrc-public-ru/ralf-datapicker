import { compareByDay } from './compareDates';
import { normalizeDate } from './normalizeDate';

type DateBoundary = Date | null | undefined;

export const isDateInRange = (
  date: Date,
  minDate: DateBoundary = undefined,
  maxDate: DateBoundary = undefined
): boolean => {
  const normalizedDate = normalizeDate(date);
  const normalizedMinDate = minDate ? normalizeDate(minDate) : undefined;
  const normalizedMaxDate = maxDate ? normalizeDate(maxDate) : undefined;

  if (
    normalizedMinDate &&
    normalizedMaxDate &&
    compareByDay(normalizedMinDate, normalizedMaxDate) > 0
  ) {
    return false;
  }

  if (normalizedMinDate && compareByDay(normalizedDate, normalizedMinDate) < 0) {
    return false;
  }

  if (normalizedMaxDate && compareByDay(normalizedDate, normalizedMaxDate) > 0) {
    return false;
  }

  return true;
};
