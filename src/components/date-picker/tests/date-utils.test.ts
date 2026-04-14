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
});
