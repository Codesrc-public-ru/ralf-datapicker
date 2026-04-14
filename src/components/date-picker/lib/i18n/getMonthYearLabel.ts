import { formatMonthLabel } from './formatMonthLabel';

const DEFAULT_LOCALE = Intl.DateTimeFormat().resolvedOptions().locale;

const normalizeLocalDate = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const getMonthYearLabel = (date, locale = DEFAULT_LOCALE) => {
  const normalizedDate = normalizeLocalDate(date);
  const monthLabel = formatMonthLabel(normalizedDate, locale);

  return `${monthLabel} ${normalizedDate.getFullYear()}`;
};
