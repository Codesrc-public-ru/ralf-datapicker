describe('DatePicker unit scaffold', () => {
  test('keeps the public component wired to the shell layers', () => {
    const source = dp.read('src/components/date-picker/DatePicker.tsx');

    expect(source).toContain("import type { DatePickerProps } from './types/public.types';");
    expect(source).toContain("import { getDialogAriaProps } from './lib/a11y/getDialogAriaProps';");
    expect(source).toContain("import { getInputDescribedBy } from './lib/a11y/getInputDescribedBy';");
    expect(source).toContain("import { getTriggerAriaLabel } from './lib/a11y/getTriggerAriaLabel';");
    expect(source).toContain("import { getMonthYearLabel } from './lib/i18n/getMonthYearLabel';");
    expect(source).toContain("import { getToday } from './lib/date/getToday';");
    expect(source).toContain("import { formatInputDate } from './lib/input/formatInputDate';");
    expect(source).toContain("import useDatePickerState from './model/useDatePickerState';");
    expect(source).toContain("import useDatePickerInput from './model/useDatePickerInput';");
    expect(source).toContain("import useDatePickerFocus from './model/useDatePickerFocus';");
    expect(source).toContain("import CalendarHeader from './ui/CalendarHeader';");
    expect(source).toContain("import DatePickerDialog from './ui/DatePickerDialog';");
    expect(source).toContain("import DatePickerField from './ui/DatePickerField';");
    expect(source).toContain("import DatePickerTrigger from './ui/DatePickerTrigger';");
    expect(source).toContain("import DatePickerError from './ui/DatePickerError';");
    expect(source).toContain('const { state, toggleDialog } = useDatePickerState(props);');
    expect(source).toContain('const displayValue = getDisplayValue(props.value, inputState.rawInputValue);');
    expect(source).toContain('const errorMessage = getValidationMessage(isInvalid, state.validation.errorMessage);');
    expect(source).toContain('const dialogMonth = state.visibleMonth ?? props.value ?? getToday();');
    expect(source).toContain(
      "const dialogAriaProps = getDialogAriaProps(state.isOpen, DIALOG_TITLE_ID);"
    );
    expect(source).toContain('return (');
    expect(source).toContain('<DatePickerField invalid={isInvalid}>');
    expect(source).toContain('aria-label={FIELD_LABEL}');
    expect(source).toContain('aria-controls={DIALOG_ID}');
    expect(source).toContain('aria-expanded={state.isOpen}');
    expect(source).toContain('aria-haspopup="dialog"');
    expect(source).toContain('aria-label={getTriggerAriaLabel(props.value, props.locale)}');
    expect(source).toContain('onClick={toggleDialog}');
    expect(source).toContain('onBlur={inputState.handleInputBlur}');
    expect(source).toContain('onChange={(event) => inputState.handleInputChange(event.currentTarget.value)}');
    expect(source).toContain('onFocus={inputState.handleInputFocus}');
    expect(source).toContain('<DatePickerError id={ERROR_ID}>{errorMessage}</DatePickerError>');
    expect(source).toContain('<DatePickerDialog {...dialogAriaProps} id={DIALOG_ID} open={state.isOpen}>');
    expect(source).toContain('<CalendarHeader id={DIALOG_TITLE_ID} label={getMonthYearLabel(dialogMonth, props.locale)} />');
    expect(source).not.toContain('CalendarGrid');
  });

  test('re-exports the public API from the feature index', () => {
    const source = dp.read('src/components/date-picker/index.ts');

    expect(source).toContain("export { default as DatePicker } from './DatePicker';");
    expect(source).toContain("export type { DatePickerProps } from './types/public.types';");
  });

  test('keeps presentational UI components separate from model and lib layers', () => {
    const uiFiles = [
      'src/components/date-picker/ui/DatePickerField.tsx',
      'src/components/date-picker/ui/DatePickerTrigger.tsx',
      'src/components/date-picker/ui/DatePickerError.tsx',
      'src/components/date-picker/ui/DatePickerDialog.tsx',
      'src/components/date-picker/ui/CalendarHeader.tsx',
      'src/components/date-picker/ui/CalendarWeekdays.tsx',
      'src/components/date-picker/ui/CalendarGrid.tsx',
      'src/components/date-picker/ui/CalendarDayCell.tsx'
    ];

    for (const file of uiFiles) {
      const source = dp.read(file);

      expect(source).not.toContain("../lib/");
      expect(source).not.toContain("../model/");
    }
  });

  test('renders dialog, grid, weekdays, and day cell semantics in UI layer', () => {
    expect(dp.read('src/components/date-picker/ui/DatePickerDialog.tsx')).toContain('role="dialog"');
    expect(dp.read('src/components/date-picker/ui/DatePickerDialog.tsx')).toContain(
      'aria-modal="true"'
    );
    expect(dp.read('src/components/date-picker/ui/CalendarGrid.tsx')).toContain('role="grid"');
    expect(dp.read('src/components/date-picker/ui/CalendarWeekdays.tsx')).toContain('scope="col"');
    expect(dp.read('src/components/date-picker/ui/CalendarDayCell.tsx')).toContain(
      'role="gridcell"'
    );
    expect(dp.read('src/components/date-picker/ui/CalendarDayCell.tsx')).toContain(
      'aria-selected'
    );
    expect(dp.read('src/components/date-picker/ui/CalendarDayCell.tsx')).toContain('disabled=');
  });

  test('keeps dialog month selection driven by value or today on open', () => {
    const source = dp.read('src/components/date-picker/model/useDatePickerState.ts');

    expect(source).toContain("import { getToday } from '../lib/date/getToday';");
    expect(source).toContain("import { normalizeDate } from '../lib/date/normalizeDate';");
    expect(source).toContain('const getInitialFocusedDate = (value: Date | null): Date => getDateOnly(value ?? getToday());');
    expect(source).toContain('const getInitialVisibleMonth = (value: Date | null): Date =>');
    expect(source).toContain('new Date(date.getFullYear(), date.getMonth(), 1)');
    expect(source).toContain('isOpen: true');
    expect(source).toContain('visibleMonth: getInitialVisibleMonth(value)');
    expect(source).toContain('focusedDate: getInitialFocusedDate(value)');
    expect(source).toContain('isOpen: false');
    expect(source).toContain('visibleMonth: null');
    expect(source).toContain('focusedDate: null');
    expect(source).toContain('toggleDialog');
    expect(source).toContain('openDialog');
    expect(source).toContain('closeDialog');
  });
});
