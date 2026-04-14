const DEFAULT_LOCALE = Intl.DateTimeFormat().resolvedOptions().locale;

const normalizeLocalDate = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const formatMonthLabel = (date, locale = DEFAULT_LOCALE) => {
  const normalizedDate = normalizeLocalDate(date);

  return new Intl.DateTimeFormat(locale, { month: 'long' }).format(normalizedDate);
};
