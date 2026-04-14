const { parseInputDate } = requireSource('src/components/date-picker/lib/input/parseInputDate.ts');
const { formatInputDate } = requireSource('src/components/date-picker/lib/input/formatInputDate.ts');
const { sanitizeInputValue } = requireSource('src/components/date-picker/lib/input/sanitizeInputValue.ts');
const { formatMonthLabel } = requireSource('src/components/date-picker/lib/i18n/formatMonthLabel.ts');
const { formatWeekdayLabel } = requireSource('src/components/date-picker/lib/i18n/formatWeekdayLabel.ts');
const { formatFullDateLabel } = requireSource('src/components/date-picker/lib/i18n/formatFullDateLabel.ts');
const { getWeekdayNames } = requireSource('src/components/date-picker/lib/i18n/getWeekdayNames.ts');
const { getFirstDayOfWeek } = requireSource('src/components/date-picker/lib/i18n/getFirstDayOfWeek.ts');
const { getTriggerAriaLabel } = requireSource(
  'src/components/date-picker/lib/a11y/getTriggerAriaLabel.ts'
);
const { getDayAriaLabel } = requireSource('src/components/date-picker/lib/a11y/getDayAriaLabel.ts');
const { getInputDescribedBy } = requireSource(
  'src/components/date-picker/lib/a11y/getInputDescribedBy.ts'
);
const { getLiveRegionMessage } = requireSource(
  'src/components/date-picker/lib/a11y/getLiveRegionMessage.ts'
);
const { getDialogAriaProps } = requireSource(
  'src/components/date-picker/lib/a11y/getDialogAriaProps.ts'
);
const { getDatePickerValidationState } = requireSource(
  'src/components/date-picker/model/validation.ts'
);

describe('Helper units', () => {
  test('sanitizes input and parses valid, partial, format, and calendar states', () => {
    expect(sanitizeInputValue(' 01 / 05 / 2026 ')).toBe('01.05.2026');
    expect(sanitizeInputValue('12-\u200b03\\2026')).toBe('12.03.2026');

    const emptyInput = parseInputDate('');
    const partialInput = parseInputDate('12.0');
    const validInput = parseInputDate('01.05.2026');
    const calendarInput = parseInputDate('31.02.2026');
    const formatInput = parseInputDate('1a.05.2026');

    expect(emptyInput.status).toBe('empty');
    expect(emptyInput.date).toBe(null);
    expect(emptyInput.errorType).toBe(null);
    expect(emptyInput.isComplete).toBe(false);
    expect(emptyInput.isPartial).toBe(false);
    expect(emptyInput.isValid).toBe(false);
    expect(partialInput.status).toBe('partial');
    expect(partialInput.date).toBe(null);
    expect(partialInput.errorType).toBe(null);
    expect(partialInput.isComplete).toBe(false);
    expect(partialInput.isPartial).toBe(true);
    expect(partialInput.isValid).toBe(false);
    expect(validInput.status).toBe('valid');
    expect(validInput.date?.getFullYear()).toBe(2026);
    expect(validInput.date?.getMonth()).toBe(4);
    expect(validInput.date?.getDate()).toBe(1);
    expect(validInput.errorType).toBe(null);
    expect(validInput.isComplete).toBe(true);
    expect(validInput.isValid).toBe(true);
    expect(calendarInput.status).toBe('calendar');
    expect(calendarInput.date).toBe(null);
    expect(calendarInput.errorType).toBe('calendar');
    expect(calendarInput.isComplete).toBe(true);
    expect(calendarInput.isPartial).toBe(false);
    expect(calendarInput.isValid).toBe(false);
    expect(formatInput.status).toBe('format');
    expect(formatInput.date).toBe(null);
    expect(formatInput.errorType).toBe('format');
    expect(formatInput.isComplete).toBe(true);
    expect(formatInput.isPartial).toBe(false);
    expect(formatInput.isValid).toBe(false);
  });

  test('formats selected dates as canonical DD.MM.YYYY text', () => {
    const date = new Date(2026, 4, 1, 22, 45);

    expect(formatInputDate(date)).toBe('01.05.2026');
  });

  test('formats locale labels and weekday names for two locales', () => {
    const date = new Date(2026, 2, 15, 22, 45);

    expect(getFirstDayOfWeek('en-US')).toBe(0);
    expect(getFirstDayOfWeek('de-DE')).toBe(1);
    expect(formatMonthLabel(date, 'en-US')).toBe('March');
    expect(formatMonthLabel(date, 'de-DE')).toBe('März');
    expect(formatWeekdayLabel(date, 'en-US')).toBe('Sun');
    expect(formatWeekdayLabel(date, 'de-DE')).toBe('So');
    expect(formatFullDateLabel(date, 'en-US')).toBe('Sunday, March 15, 2026');
    expect(formatFullDateLabel(date, 'de-DE')).toBe('Sonntag, 15. März 2026');
    expect(getWeekdayNames('en-US').join(',')).toBe('Sun,Mon,Tue,Wed,Thu,Fri,Sat');
    expect(getWeekdayNames('de-DE').join(',')).toBe('Mo,Di,Mi,Do,Fr,Sa,So');
  });

  test('builds trigger, day, describedBy, live region, and dialog a11y text deterministically', () => {
    const selectedDate = new Date(2026, 4, 1, 22, 30);
    const dayDate = new Date(2026, 4, 13, 10, 15);

    expect(getTriggerAriaLabel(null, 'en-US')).toBe('Choose date');
    expect(getTriggerAriaLabel(selectedDate, 'en-US')).toBe(
      'Change date, selected Friday, May 1, 2026'
    );
    expect(getDayAriaLabel(dayDate, { locale: 'en-US' })).toBe('Wednesday, May 13, 2026');
    expect(
      getDayAriaLabel(dayDate, {
        locale: 'en-US',
        selected: true,
        unavailable: true,
        outsideMonth: true
      })
    ).toBe('Wednesday, May 13, 2026, selected, unavailable, outside current month');
    expect(getInputDescribedBy('error-id', ' help-id ', '', 'error-id', null)).toBe('error-id help-id');
    expect(getLiveRegionMessage('  May 2026  ', '', 'selected date updated', null)).toBe(
      'May 2026 selected date updated'
    );
    const openDialogProps = getDialogAriaProps(true);
    const closedDialogProps = getDialogAriaProps(false, 'custom-title');

    expect(openDialogProps.role).toBe('dialog');
    expect(openDialogProps['aria-modal']).toBe('true');
    expect(openDialogProps['aria-labelledby']).toBe('date-picker-dialog-title');
    expect(closedDialogProps.role).toBe('dialog');
    expect(closedDialogProps['aria-modal']).toBe('true');
    expect(closedDialogProps['aria-labelledby']).toBe('custom-title');
    expect(closedDialogProps.hidden).toBe(true);
  });

  test('resolves validation priority one error at a time', () => {
    const invalidFormat = getDatePickerValidationState({
      parsedInput: parseInputDate('1a.05.2026'),
      candidateDate: null,
      minDate: new Date(2026, 0, 1),
      maxDate: new Date(2026, 11, 31),
      externalInvalid: true,
      externalErrorMessage: 'External error',
      required: true,
      isVisible: true
    });

    const rangeInvalid = getDatePickerValidationState({
      parsedInput: parseInputDate('01.05.2026'),
      candidateDate: new Date(2026, 4, 1),
      minDate: new Date(2026, 4, 2),
      maxDate: new Date(2026, 4, 31),
      externalInvalid: true,
      externalErrorMessage: 'External error',
      required: true,
      isVisible: true
    });

    const externalInvalid = getDatePickerValidationState({
      parsedInput: parseInputDate('01.05.2026'),
      candidateDate: new Date(2026, 4, 1),
      minDate: new Date(2026, 0, 1),
      maxDate: new Date(2026, 11, 31),
      externalInvalid: true,
      externalErrorMessage: 'External error',
      required: true,
      isVisible: false
    });

    const requiredInvalid = getDatePickerValidationState({
      parsedInput: parseInputDate(''),
      candidateDate: null,
      minDate: new Date(2026, 0, 1),
      maxDate: new Date(2026, 11, 31),
      externalInvalid: false,
      externalErrorMessage: 'External error',
      required: true,
      isVisible: false
    });

    const validState = getDatePickerValidationState({
      parsedInput: parseInputDate('01.05.2026'),
      candidateDate: new Date(2026, 4, 1),
      minDate: new Date(2026, 0, 1),
      maxDate: new Date(2026, 11, 31),
      externalInvalid: false,
      externalErrorMessage: null,
      required: false,
      isVisible: false
    });

    expect(invalidFormat.errorType).toBe('format');
    expect(invalidFormat.errorMessage).toBe('Use DD.MM.YYYY');
    expect(invalidFormat.isVisible).toBe(true);
    expect(invalidFormat.isInvalid).toBe(true);
    expect(rangeInvalid.errorType).toBe('range');
    expect(rangeInvalid.errorMessage).toBe('Choose a date between 02.05.2026 and 31.05.2026');
    expect(rangeInvalid.isVisible).toBe(true);
    expect(rangeInvalid.isInvalid).toBe(true);
    expect(externalInvalid.errorType).toBe('external');
    expect(externalInvalid.errorMessage).toBe('External error');
    expect(externalInvalid.isVisible).toBe(false);
    expect(externalInvalid.isInvalid).toBe(true);
    expect(requiredInvalid.errorType).toBe('required');
    expect(requiredInvalid.errorMessage).toBe('Date is required');
    expect(requiredInvalid.isVisible).toBe(false);
    expect(requiredInvalid.isInvalid).toBe(true);
    expect(validState.errorType).toBe(null);
    expect(validState.errorMessage).toBe(null);
    expect(validState.isVisible).toBe(false);
    expect(validState.isInvalid).toBe(false);
  });
});
