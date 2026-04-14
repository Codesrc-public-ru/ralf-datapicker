import { formatWeekdayLabel } from './formatWeekdayLabel';
import { getFirstDayOfWeek } from './getFirstDayOfWeek';

const DEFAULT_LOCALE = Intl.DateTimeFormat().resolvedOptions().locale;
const DAYS_IN_WEEK = 7;
const WEEKDAY_REFERENCE_START = new Date(2024, 0, 7);

const getReferenceWeekdayDate = (firstDayOfWeek: number, offset: number): Date =>
  new Date(
    WEEKDAY_REFERENCE_START.getFullYear(),
    WEEKDAY_REFERENCE_START.getMonth(),
    WEEKDAY_REFERENCE_START.getDate() + firstDayOfWeek + offset
  );

export const getWeekdayNames = (locale: string = DEFAULT_LOCALE): string[] => {
  const firstDayOfWeek = getFirstDayOfWeek(locale);

  return Array.from({ length: DAYS_IN_WEEK }, (_, offset) =>
    formatWeekdayLabel(getReferenceWeekdayDate(firstDayOfWeek, offset), locale)
  );
};
