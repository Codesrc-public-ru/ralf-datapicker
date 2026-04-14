import { normalizeDate } from './normalizeDate';

const normalizeFirstDayOfWeek = (firstDayOfWeek: number): number => {
  const normalized = firstDayOfWeek % 7;
  return normalized < 0 ? normalized + 7 : normalized;
};

export const startOfWeek = (date: Date, firstDayOfWeek = 0): Date => {
  const normalizedDate = normalizeDate(date);
  const normalizedFirstDayOfWeek = normalizeFirstDayOfWeek(firstDayOfWeek);
  const dayOffset = (normalizedDate.getDay() - normalizedFirstDayOfWeek + 7) % 7;

  return new Date(
    normalizedDate.getFullYear(),
    normalizedDate.getMonth(),
    normalizedDate.getDate() - dayOffset
  );
};
