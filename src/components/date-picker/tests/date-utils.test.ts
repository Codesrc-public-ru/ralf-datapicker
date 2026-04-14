describe('Date utilities scaffold', () => {
  test('keeps the pure date helpers in the lib/date layer', () => {
    const files = [
      'src/components/date-picker/lib/date/addDays.ts',
      'src/components/date-picker/lib/date/addMonths.ts',
      'src/components/date-picker/lib/date/addYears.ts',
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
    const compareDatesSource = dp.read('src/components/date-picker/lib/date/compareDates.ts');
    const sameDaySource = dp.read('src/components/date-picker/lib/date/isSameDay.ts');
    const sameMonthSource = dp.read('src/components/date-picker/lib/date/isSameMonth.ts');
    const todaySource = dp.read('src/components/date-picker/lib/date/getToday.ts');
    const startOfWeekSource = dp.read('src/components/date-picker/lib/date/startOfWeek.ts');
    const firstDayOfWeekSource = dp.read('src/components/date-picker/lib/i18n/getFirstDayOfWeek.ts');
    const monthMatrixSource = dp.read('src/components/date-picker/lib/date/buildMonthMatrix.ts');

    expect(normalizeDateSource).toContain('new Date(date.getFullYear(), date.getMonth(), date.getDate())');
    expect(compareDatesSource).toContain('export const compareByDay');
    expect(compareDatesSource).toContain('export const compareDates = compareByDay;');
    expect(sameDaySource).toContain("import { compareByDay } from './compareDates';");
    expect(sameMonthSource).toContain('getFullYear() === right.getFullYear()');
    expect(todaySource).toContain("import { normalizeDate } from './normalizeDate';");
    expect(todaySource).toContain('normalizeDate(new Date())');
    expect(startOfWeekSource).toContain("import { normalizeDate } from './normalizeDate';");
    expect(startOfWeekSource).toContain('normalizeFirstDayOfWeek');
    expect(startOfWeekSource).toContain('const dayOffset = (normalizedDate.getDay() - normalizedFirstDayOfWeek + 7) % 7;');
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
});
