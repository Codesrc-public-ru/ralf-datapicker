const DEFAULT_LOCALE = Intl.DateTimeFormat().resolvedOptions().locale;

const normalizeLocalDate = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const formatWeekdayLabel = (date, locale = DEFAULT_LOCALE) => {
  const normalizedDate = normalizeLocalDate(date);

  return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(normalizedDate);
};
