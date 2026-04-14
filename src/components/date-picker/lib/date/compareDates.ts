type DayComparison = -1 | 0 | 1;

const compareNumbers = (left: number, right: number): DayComparison => {
  if (left < right) {
    return -1;
  }

  if (left > right) {
    return 1;
  }

  return 0;
};

const compareDateParts = (left: Date, right: Date): DayComparison => {
  const yearComparison = compareNumbers(left.getFullYear(), right.getFullYear());
  if (yearComparison !== 0) {
    return yearComparison;
  }

  const monthComparison = compareNumbers(left.getMonth(), right.getMonth());
  if (monthComparison !== 0) {
    return monthComparison;
  }

  return compareNumbers(left.getDate(), right.getDate());
};

export const compareByDay = (left: Date, right: Date): DayComparison =>
  compareDateParts(left, right);

export const compareDates = compareByDay;
