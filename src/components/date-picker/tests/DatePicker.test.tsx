describe('DatePicker unit scaffold', () => {
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
      .replace(
        /^\s*import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];\s*$/gm,
        (_, names) => `const { ${names} } = deps;`
      )
      .replace(/^\s*import\s+type\s+\{[^}]+\}\s+from\s+['"][^'"]+['"];\s*$/gm, '')
      .replace(/^\s*export\s+default\s+function\s+/gm, 'function ')
      .replace(/^\s*export\s+default\s+/gm, '')
      .replace(/^\s*export\s+/gm, '');

    return new Function('deps', `${transformed}\nreturn { ${exportNames.join(', ')} };`)(deps);
  }

  test('keeps the public component wired to the shell layers', () => {
    const source = dp.read('src/components/date-picker/DatePicker.tsx');

    expect(source).toContain("import type { DatePickerProps } from './types/public.types';");
    expect(source).toContain("import { ACCESSIBILITY_CONSTANTS } from './constants/accessibility';");
    expect(source).toContain("import { getDialogAriaProps } from './lib/a11y/getDialogAriaProps';");
    expect(source).toContain("import { getDayAriaLabel } from './lib/a11y/getDayAriaLabel';");
    expect(source).toContain("import { getInputDescribedBy } from './lib/a11y/getInputDescribedBy';");
    expect(source).toContain("import { getTriggerAriaLabel } from './lib/a11y/getTriggerAriaLabel';");
    expect(source).toContain("import { buildMonthMatrix } from './lib/date/buildMonthMatrix';");
    expect(source).toContain("import { getFirstDayOfWeek } from './lib/i18n/getFirstDayOfWeek';");
    expect(source).toContain("import { getMonthYearLabel } from './lib/i18n/getMonthYearLabel';");
    expect(source).toContain("import { getWeekdayNames } from './lib/i18n/getWeekdayNames';");
    expect(source).toContain("import { getToday } from './lib/date/getToday';");
    expect(source).toContain("import { formatInputDate } from './lib/input/formatInputDate';");
    expect(source).toContain("import { isDateDisabled } from './lib/date/isDateDisabled';");
    expect(source).toContain("import { isSameDay } from './lib/date/isSameDay';");
    expect(source).toContain("import { isSameMonth } from './lib/date/isSameMonth';");
    expect(source).toContain("import { normalizeDate } from './lib/date/normalizeDate';");
    expect(source).toContain("import useDatePickerState from './model/useDatePickerState';");
    expect(source).toContain("import useDatePickerInput from './model/useDatePickerInput';");
    expect(source).toContain("import useDatePickerFocus from './model/useDatePickerFocus';");
    expect(source).toContain("import useDatePickerKeyboard from './model/useDatePickerKeyboard';");
    expect(source).toContain("import useDatePickerSelection from './model/useDatePickerSelection';");
    expect(source).toContain("import CalendarHeader from './ui/CalendarHeader';");
    expect(source).toContain("import CalendarDayCell from './ui/CalendarDayCell';");
    expect(source).toContain("import CalendarGrid from './ui/CalendarGrid';");
    expect(source).toContain("import CalendarWeekdays from './ui/CalendarWeekdays';");
    expect(source).toContain("import DatePickerDialog from './ui/DatePickerDialog';");
    expect(source).toContain("import DatePickerField from './ui/DatePickerField';");
    expect(source).toContain("import DatePickerTrigger from './ui/DatePickerTrigger';");
    expect(source).toContain("import DatePickerError from './ui/DatePickerError';");
    expect(source).toContain('const datePickerState = useDatePickerState(props);');
    expect(source).toContain(
      'const { state, closeDialog, toggleDialog, setLiveRegionMessage } = datePickerState;'
    );
    expect(source).toContain('const keyboardState = useDatePickerKeyboard({');
    expect(source).toContain('const { handleDaySelect } = useDatePickerSelection({');
    expect(source).toContain('setLiveRegionMessage: datePickerState.setLiveRegionMessage');
    expect(source).toContain(
      'const displayValue = getDisplayValue('
    );
    expect(source).toContain('inputState.isInputFocused || inputState.isInputDirty');
    expect(source).toContain('value ? formatInputDate(value) : \'\';');
    expect(source).toContain('const errorMessage = getValidationMessage(isInvalid, state.validation.errorMessage);');
    expect(source).toContain('const dialogMonth = state.visibleMonth ?? props.value ?? getToday();');
    expect(source).toContain('const dialogMonthMatrix = buildMonthMatrix(');
    expect(source).toContain('const weekdayLabels = getWeekdayNames(props.locale);');
    expect(source).toContain('const selectedDate = props.value ? normalizeDate(props.value) : null;');
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
    expect(source).toContain('role="status"');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain('id={ACCESSIBILITY_CONSTANTS.LIVE_REGION_ID}');
    expect(source).toContain('{state.liveRegionMessage}');
    expect(source).toContain('onKeyDown={focusState.handleDialogKeyDown}');
    expect(source).toContain('<DatePickerDialog');
    expect(source).toContain('<CalendarHeader id={DIALOG_TITLE_ID} label={getMonthYearLabel(dialogMonth, props.locale)} />');
    expect(source).toContain('<CalendarGrid');
    expect(source).toContain('onKeyDown={keyboardState.handleGridKeyDown}');
    expect(source).toContain('<CalendarWeekdays weekdayLabels={weekdayLabels} />');
    expect(source).toContain('const unavailable = isDateDisabled(day, selectionOptions);');
    expect(source).toContain('onClick: () => handleDaySelect(day)');
    expect(source).toContain('onFocus: keyboardState.handleDayFocus(day)');
    expect(source).toContain('ref: keyboardState.registerDayButton(day)');
    expect(source).toContain('tabIndex: focused ? 0 : -1');
    expect(source).toContain('<CalendarDayCell');
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
    expect(source).toContain('setFocusedDate');
    expect(source).toContain('setVisibleMonth');
    expect(source).toContain('setLastKeyPressed');
  });

  test('selects an available day and closes the dialog', () => {
    const closeCalls = [];
    const changeCalls = [];
    const liveCalls = [];
    const normalizedDate = new Date(2026, 4, 1);
    const { formatFullDateLabel } = loadModule(
      'src/components/date-picker/lib/i18n/formatFullDateLabel.ts',
      ['formatFullDateLabel']
    );
    const { getLiveRegionMessage } = loadModule(
      'src/components/date-picker/lib/a11y/getLiveRegionMessage.ts',
      ['getLiveRegionMessage']
    );

    const { selectDate } = loadModule(
      'src/components/date-picker/model/useDatePickerSelection.ts',
      ['selectDate'],
      {
        formatFullDateLabel,
        getLiveRegionMessage,
        isDateDisabled: (date) => date.getDate() === 13,
        normalizeDate: (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
      }
    );

    const accepted = selectDate(new Date(2026, 4, 1, 18, 30), {
      closeDialog: () => closeCalls.push('closed'),
      disabledDates: [],
      locale: 'en-US',
      onChange: (value) => changeCalls.push(value),
      setLiveRegionMessage: (value) => liveCalls.push(value)
    });

    const rejected = selectDate(new Date(2026, 4, 13, 12, 0), {
      closeDialog: () => closeCalls.push('closed'),
      disabledDates: [],
      locale: 'en-US',
      onChange: (value) => changeCalls.push(value),
      setLiveRegionMessage: (value) => liveCalls.push(value)
    });

    expect(accepted).toBe(true);
    expect(rejected).toBe(false);
    expect(changeCalls).toHaveLength(1);
    expect(changeCalls[0]).toEqual(normalizedDate);
    expect(liveCalls).toHaveLength(1);
    expect(liveCalls[0]).toBe(
      getLiveRegionMessage(formatFullDateLabel(normalizedDate, 'en-US'), 'selected')
    );
    expect(closeCalls).toHaveLength(1);
  });
});
