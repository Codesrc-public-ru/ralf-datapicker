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
      'src/components/date-picker/lib/date/startOfMonth.ts',
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
      'src/components/date-picker/lib/date/startOfMonth.ts',
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
    const startOfMonthSource = dp.read('src/components/date-picker/lib/date/startOfMonth.ts');
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
    expect(startOfMonthSource).toContain('new Date(date.getFullYear(), date.getMonth(), 1)');
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

  test('avoids raw timestamp and Date mutation APIs in date-picker source', () => {
    const files = [
      'src/components/date-picker/DatePicker.tsx',
      'src/components/date-picker/lib/a11y/getDayAriaLabel.ts',
      'src/components/date-picker/lib/a11y/getDialogAriaProps.ts',
      'src/components/date-picker/lib/a11y/getInputDescribedBy.ts',
      'src/components/date-picker/lib/a11y/getLiveRegionMessage.ts',
      'src/components/date-picker/lib/a11y/getTriggerAriaLabel.ts',
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
      'src/components/date-picker/lib/date/navigation.ts',
      'src/components/date-picker/lib/date/normalizeDate.ts',
      'src/components/date-picker/lib/date/startOfMonth.ts',
      'src/components/date-picker/lib/date/startOfWeek.ts',
      'src/components/date-picker/model/useDatePickerInput.ts',
      'src/components/date-picker/model/useDatePickerKeyboard.ts',
      'src/components/date-picker/model/useDatePickerSelection.ts',
      'src/components/date-picker/model/useDatePickerState.ts'
    ];

    const forbiddenPatterns = [
      'getTime(',
      'valueOf(',
      'setMonth(',
      'setDate(',
      'setFullYear('
    ];

    for (const file of files) {
      const source = dp.read(file);

      for (const pattern of forbiddenPatterns) {
        expect(source).not.toContain(pattern);
      }
    }
  });
});

describe('I18n helpers', () => {
  function loadModule(relativePath, exportNames, deps = {}) {
    const source = ts.transpileModule(dp.read(relativePath), {
      compilerOptions: {
        esModuleInterop: true,
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022
      }
    }).outputText;
    const transformed = source
      .replace(/^\s*import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];\s*$/gm, (_, names) => {
        return `const { ${names} } = deps;`;
      })
      .replace(/^\s*export\s+/gm, '');

    return new Function(
      'deps',
      `${transformed}\nreturn { ${exportNames.join(', ')} };`
    )(deps);
  }

  test('reads locale-specific first day of week from Intl', () => {
    const { getFirstDayOfWeek } = loadModule(
      'src/components/date-picker/lib/i18n/getFirstDayOfWeek.ts',
      ['getFirstDayOfWeek']
    );

    expect(getFirstDayOfWeek('en-US')).toBe(0);
    expect(getFirstDayOfWeek('de-DE')).toBe(1);
  });

  test('formats month, month-year, weekday, and full date labels for two locales', () => {
    const { formatMonthLabel } = loadModule(
      'src/components/date-picker/lib/i18n/formatMonthLabel.ts',
      ['formatMonthLabel']
    );
    const { getMonthYearLabel } = loadModule(
      'src/components/date-picker/lib/i18n/getMonthYearLabel.ts',
      ['getMonthYearLabel'],
      { formatMonthLabel }
    );
    const { formatWeekdayLabel } = loadModule(
      'src/components/date-picker/lib/i18n/formatWeekdayLabel.ts',
      ['formatWeekdayLabel']
    );
    const { formatFullDateLabel } = loadModule(
      'src/components/date-picker/lib/i18n/formatFullDateLabel.ts',
      ['formatFullDateLabel']
    );

    const date = new Date(2026, 2, 15, 22, 45);

    expect(formatMonthLabel(date, 'en-US')).toBe('March');
    expect(formatMonthLabel(date, 'de-DE')).toBe('März');
    expect(getMonthYearLabel(date, 'en-US')).toBe('March 2026');
    expect(getMonthYearLabel(date, 'de-DE')).toBe('März 2026');
    expect(formatWeekdayLabel(date, 'en-US')).toBe('Sun');
    expect(formatWeekdayLabel(date, 'de-DE')).toBe('So');
    expect(formatFullDateLabel(date, 'en-US')).toBe('Sunday, March 15, 2026');
    expect(formatFullDateLabel(date, 'de-DE')).toBe('Sonntag, 15. März 2026');
  });

  test('returns weekday names in locale order', () => {
    const { formatWeekdayLabel } = loadModule(
      'src/components/date-picker/lib/i18n/formatWeekdayLabel.ts',
      ['formatWeekdayLabel']
    );
    const { getFirstDayOfWeek } = loadModule(
      'src/components/date-picker/lib/i18n/getFirstDayOfWeek.ts',
      ['getFirstDayOfWeek']
    );
    const { getWeekdayNames } = loadModule(
      'src/components/date-picker/lib/i18n/getWeekdayNames.ts',
      ['getWeekdayNames'],
      { formatWeekdayLabel, getFirstDayOfWeek }
    );

    expect(getWeekdayNames('en-US')).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    expect(getWeekdayNames('de-DE')).toEqual(['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']);
  });
});
