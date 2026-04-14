import { formatMonthLabel } from './formatMonthLabel';

const DEFAULT_LOCALE = Intl.DateTimeFormat().resolvedOptions().locale;

const normalizeLocalDate = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const getMonthYearLabel = (date: Date, locale: string = DEFAULT_LOCALE): string => {
  const normalizedDate = normalizeLocalDate(date);
  const monthLabel = formatMonthLabel(normalizedDate, locale);

  return `${monthLabel} ${normalizedDate.getFullYear()}`;
};
