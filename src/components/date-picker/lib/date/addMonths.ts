import { normalizeDate } from './normalizeDate';

const getLastDayOfMonth = (year: number, month: number): number =>
  new Date(year, month + 1, 0).getDate();

export const addMonths = (date: Date, amount: number): Date => {
  const normalizedDate = normalizeDate(date);
  const wholeMonths = Math.trunc(amount);
  const targetMonth = new Date(
    normalizedDate.getFullYear(),
    normalizedDate.getMonth() + wholeMonths,
    1
  );
  const lastDayOfTargetMonth = getLastDayOfMonth(
    targetMonth.getFullYear(),
    targetMonth.getMonth()
  );
  const targetDay = Math.min(normalizedDate.getDate(), lastDayOfTargetMonth);

  return new Date(
    targetMonth.getFullYear(),
    targetMonth.getMonth(),
    targetDay
  );
};
