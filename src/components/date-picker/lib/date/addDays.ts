import { normalizeDate } from './normalizeDate';

export const addDays = (date: Date, amount: number): Date => {
  const normalizedDate = normalizeDate(date);
  const wholeDays = Math.trunc(amount);

  return new Date(
    normalizedDate.getFullYear(),
    normalizedDate.getMonth(),
    normalizedDate.getDate() + wholeDays
  );
};
