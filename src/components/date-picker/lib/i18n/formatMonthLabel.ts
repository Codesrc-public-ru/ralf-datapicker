const DEFAULT_LOCALE = Intl.DateTimeFormat().resolvedOptions().locale;

const normalizeLocalDate = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const formatMonthLabel = (date: Date, locale: string = DEFAULT_LOCALE): string => {
  const normalizedDate = normalizeLocalDate(date);

  return new Intl.DateTimeFormat(locale, { month: 'long' }).format(normalizedDate);
};
