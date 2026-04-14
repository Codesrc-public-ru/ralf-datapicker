import { normalizeDate } from './normalizeDate';

const getLastDayOfMonth = (year: number, month: number): number =>
  new Date(year, month + 1, 0).getDate();

export const addYears = (date: Date, amount: number): Date => {
  const normalizedDate = normalizeDate(date);
  const wholeYears = Math.trunc(amount);
  const targetYear = normalizedDate.getFullYear() + wholeYears;
  const lastDayOfTargetMonth = getLastDayOfMonth(targetYear, normalizedDate.getMonth());
  const targetDay = Math.min(normalizedDate.getDate(), lastDayOfTargetMonth);

  return new Date(targetYear, normalizedDate.getMonth(), targetDay);
};
