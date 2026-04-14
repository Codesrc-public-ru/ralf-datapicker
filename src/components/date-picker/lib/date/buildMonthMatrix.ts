import { getFirstDayOfWeek } from '../i18n/getFirstDayOfWeek';
import { startOfWeek } from './startOfWeek';

const DAYS_IN_WEEK = 7;
const WEEKS_IN_MONTH_GRID = 6;

export const buildMonthMatrix = (
  year: number,
  month: number,
  firstDayOfWeek = getFirstDayOfWeek(year, month)
): Date[][] => {
  const firstOfMonth = new Date(year, month, 1);
  const gridStart = startOfWeek(firstOfMonth, firstDayOfWeek);
  const matrix: Date[][] = [];
  let currentDate = gridStart;

  for (let weekIndex = 0; weekIndex < WEEKS_IN_MONTH_GRID; weekIndex += 1) {
    const week: Date[] = [];

    for (let dayIndex = 0; dayIndex < DAYS_IN_WEEK; dayIndex += 1) {
      week.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
      currentDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() + 1
      );
    }

    matrix.push(week);
  }

  return matrix;
};
