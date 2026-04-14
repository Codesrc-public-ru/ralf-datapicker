describe('Date utilities scaffold', () => {
  test('keeps the pure date helpers in the lib/date layer', () => {
    const files = [
      'src/components/date-picker/lib/date/addDays.ts',
      'src/components/date-picker/lib/date/addMonths.ts',
      'src/components/date-picker/lib/date/addYears.ts',
      'src/components/date-picker/lib/date/navigation.ts',
      'src/components/date-picker/lib/date/buildMonthMatrix.ts',
      'src/components/date-picker/lib/date/compareDates.ts',
      'src/components/date-picker/lib/date/getToday.ts',
      'src/components/date-picker/lib/date/isDateDisabled.ts',
      'src/components/date-picker/lib/date/isDateInRange.ts',
      'src/components/date-picker/lib/date/isSameDay.ts',
      'src/components/date-picker/lib/date/isSameMonth.ts',
      'src/components/date-picker/lib/date/normalizeDate.ts',
      'src/components/date-picker/lib/date/startOfWeek.ts'
    ];

    for (const file of files) {
      expect(dp.exists(file)).toBe(true);
    }
  });

  test('keeps date helpers free of React imports', () => {
    const files = [
      'src/components/date-picker/lib/date/addDays.ts',
      'src/components/date-picker/lib/date/addMonths.ts',
      'src/components/date-picker/lib/date/addYears.ts',
      'src/components/date-picker/lib/date/navigation.ts',
      'src/components/date-picker/lib/date/buildMonthMatrix.ts',
      'src/components/date-picker/lib/date/compareDates.ts',
      'src/components/date-picker/lib/date/getToday.ts',
      'src/components/date-picker/lib/date/isDateDisabled.ts',
      'src/components/date-picker/lib/date/isDateInRange.ts',
      'src/components/date-picker/lib/date/isSameDay.ts',
      'src/components/date-picker/lib/date/isSameMonth.ts',
      'src/components/date-picker/lib/date/normalizeDate.ts',
      'src/components/date-picker/lib/date/startOfWeek.ts'
    ];

    for (const file of files) {
      const source = dp.read(file).toLowerCase();
      expect(source).not.toContain('react');
      expect(source).not.toContain('jsx');
    }
  });

  test('normalizes, compares, and reads today as date-only helpers', () => {
    const normalizeDateSource = dp.read('src/components/date-picker/lib/date/normalizeDate.ts');
    const addDaysSource = dp.read('src/components/date-picker/lib/date/addDays.ts');
    const addMonthsSource = dp.read('src/components/date-picker/lib/date/addMonths.ts');
    const addYearsSource = dp.read('src/components/date-picker/lib/date/addYears.ts');
    const compareDatesSource = dp.read('src/components/date-picker/lib/date/compareDates.ts');
    const sameDaySource = dp.read('src/components/date-picker/lib/date/isSameDay.ts');
    const sameMonthSource = dp.read('src/components/date-picker/lib/date/isSameMonth.ts');
    const todaySource = dp.read('src/components/date-picker/lib/date/getToday.ts');
    const startOfWeekSource = dp.read('src/components/date-picker/lib/date/startOfWeek.ts');
    const navigationSource = dp.read('src/components/date-picker/lib/date/navigation.ts');
    const firstDayOfWeekSource = dp.read('src/components/date-picker/lib/i18n/getFirstDayOfWeek.ts');
    const monthMatrixSource = dp.read('src/components/date-picker/lib/date/buildMonthMatrix.ts');

    expect(normalizeDateSource).toContain('new Date(date.getFullYear(), date.getMonth(), date.getDate())');
    expect(addDaysSource).toContain("import { normalizeDate } from './normalizeDate';");
    expect(addDaysSource).toContain('Math.trunc(amount)');
    expect(addDaysSource).toContain('normalizedDate.getDate() + wholeDays');
    expect(addMonthsSource).toContain("import { normalizeDate } from './normalizeDate';");
    expect(addMonthsSource).toContain('getLastDayOfMonth');
    expect(addMonthsSource).toContain('Math.min(normalizedDate.getDate(), lastDayOfTargetMonth)');
    expect(addYearsSource).toContain("import { normalizeDate } from './normalizeDate';");
    expect(addYearsSource).toContain('Math.min(normalizedDate.getDate(), lastDayOfTargetMonth)');
    expect(compareDatesSource).toContain('export const compareByDay');
    expect(compareDatesSource).toContain('export const compareDates = compareByDay;');
    expect(sameDaySource).toContain("import { compareByDay } from './compareDates';");
    expect(sameMonthSource).toContain('getFullYear() === right.getFullYear()');
    expect(todaySource).toContain("import { normalizeDate } from './normalizeDate';");
    expect(todaySource).toContain('normalizeDate(new Date())');
    expect(startOfWeekSource).toContain("import { normalizeDate } from './normalizeDate';");
    expect(startOfWeekSource).toContain('normalizeFirstDayOfWeek');
    expect(startOfWeekSource).toContain('const dayOffset = (normalizedDate.getDay() - normalizedFirstDayOfWeek + 7) % 7;');
    expect(navigationSource).toContain("import { addDays } from './addDays';");
    expect(navigationSource).toContain("import { addMonths } from './addMonths';");
    expect(navigationSource).toContain("import { addYears } from './addYears';");
    expect(navigationSource).toContain("import { startOfWeek } from './startOfWeek';");
    expect(navigationSource).toContain('export const moveDateByWeeks');
    expect(navigationSource).toContain('export const getHomeDate');
    expect(navigationSource).toContain('export const getEndDate');
    expect(navigationSource).toContain('export const getPageUpDate');
    expect(navigationSource).toContain('export const getPageDownDate');
    expect(navigationSource).toContain('export const getShiftPageUpDate');
    expect(navigationSource).toContain('export const getShiftPageDownDate');
    expect(firstDayOfWeekSource).toContain("new Intl.Locale(locale).weekInfo");
    expect(firstDayOfWeekSource).toContain('DEFAULT_LOCALE');
    expect(firstDayOfWeekSource).toContain('REGION_FIRST_DAY');
    expect(monthMatrixSource).toContain("import { getFirstDayOfWeek } from '../i18n/getFirstDayOfWeek';");
    expect(monthMatrixSource).toContain("import { startOfWeek } from './startOfWeek';");
    expect(monthMatrixSource).toContain('const WEEKS_IN_MONTH_GRID = 6;');
    expect(monthMatrixSource).toContain('const DAYS_IN_WEEK = 7;');
    expect(monthMatrixSource).toContain('const gridStart = startOfWeek(firstOfMonth, firstDayOfWeek);');
    expect(monthMatrixSource).toContain('for (let weekIndex = 0; weekIndex < WEEKS_IN_MONTH_GRID; weekIndex += 1)');
    expect(monthMatrixSource).toContain('for (let dayIndex = 0; dayIndex < DAYS_IN_WEEK; dayIndex += 1)');
    expect(monthMatrixSource).toContain('matrix.push(week);');
  });

  test('keeps range checks inclusive and date-only', () => {
    const rangeSource = dp.read('src/components/date-picker/lib/date/isDateInRange.ts');

    expect(rangeSource).toContain("import { compareByDay } from './compareDates';");
    expect(rangeSource).toContain("import { normalizeDate } from './normalizeDate';");
    expect(rangeSource).toContain('normalizedMinDate &&');
    expect(rangeSource).toContain('normalizedMaxDate &&');
    expect(rangeSource).toContain('compareByDay(normalizedMinDate, normalizedMaxDate) > 0');
    expect(rangeSource).toContain('compareByDay(normalizedDate, normalizedMinDate) < 0');
    expect(rangeSource).toContain('compareByDay(normalizedDate, normalizedMaxDate) > 0');
    expect(rangeSource).toContain('return true;');
  });

  test('keeps disabled date logic deterministic for range, array, and predicate rules', () => {
    const disabledSource = dp.read('src/components/date-picker/lib/date/isDateDisabled.ts');

    expect(disabledSource).toContain("import type { DatePickerDisabledDates } from '../../types/public.types';");
    expect(disabledSource).toContain("import { isDateInRange } from './isDateInRange';");
    expect(disabledSource).toContain("import { isSameDay } from './isSameDay';");
    expect(disabledSource).toContain("import { normalizeDate } from './normalizeDate';");
    expect(disabledSource).toContain('const isDisabledDatesPredicate =');
    expect(disabledSource).toContain("typeof disabledDates === 'function'");
    expect(disabledSource).toContain('isDateInRange(normalizedDate, options.minDate, options.maxDate)');
    expect(disabledSource).toContain('disabledDates(normalizedDate)');
    expect(disabledSource).toContain('disabledDates.some((disabledDate) => isSameDay(normalizedDate, disabledDate))');
  });
});
