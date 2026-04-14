describe('Input helper layer', () => {
  test('keeps sanitize, parse, and format helpers together', () => {
    expect(dp.exists('src/components/date-picker/lib/input/sanitizeInputValue.ts')).toBe(true);
    expect(dp.exists('src/components/date-picker/lib/input/parseInputDate.ts')).toBe(true);
    expect(dp.exists('src/components/date-picker/lib/input/formatInputDate.ts')).toBe(true);
  });

  test('sanitizes pasted separators but keeps invalid draft text visible', () => {
    const source = dp.read('src/components/date-picker/lib/input/sanitizeInputValue.ts');

    expect(source).toContain("char === '/' || char === '\\\\' || char === '-'");
    expect(source).toContain('charCodeAt(0)');
    expect(source).toContain("replace(SPACING_AROUND_DOTS_PATTERN, '.')");
    expect(source).toContain("replace(MULTIPLE_DOTS_PATTERN, '.')");
    expect(source).toContain('trim()');
    expect(source).not.toContain('window');
    expect(source).not.toContain('document');
  });

  test('parses empty, partial, valid, format, and calendar states explicitly', () => {
    const source = dp.read('src/components/date-picker/lib/input/parseInputDate.ts');

    expect(source).toContain("export type InputDateParseStatus = 'empty' | 'partial' | 'valid' | 'format' | 'calendar';");
    expect(source).toContain("import { sanitizeInputValue } from './sanitizeInputValue';");
    expect(source).toContain('FULL_INPUT_PATTERN');
    expect(source).toContain('PARTIAL_INPUT_PATTERN');
    expect(source).toContain("status: 'empty'");
    expect(source).toContain("status: 'partial'");
    expect(source).toContain("status: 'valid'");
    expect(source).toContain("status: 'format'");
    expect(source).toContain("status: 'calendar'");
    expect(source).toContain('setFullYear(year, monthIndex, day)');
    expect(source).toContain('candidateDate.getFullYear() === year');
    expect(source).toContain("errorType: 'format'");
    expect(source).toContain("errorType: 'calendar'");
  });

  test('formats selected dates as canonical DD.MM.YYYY text', () => {
    const source = dp.read('src/components/date-picker/lib/input/formatInputDate.ts');

    expect(source).toContain("padStart(2, '0')");
    expect(source).toContain("padStart(4, '0')");
    expect(source).toContain('date.getDate()');
    expect(source).toContain('date.getMonth() + 1');
    expect(source).toContain('date.getFullYear()');
    expect(source).toContain("return `${day}.${month}.${year}`");
  });

  test('keeps the temporary input draft synced to external value changes', () => {
    const source = dp.read('src/components/date-picker/model/useDatePickerInput.ts');

    expect(source).toContain("import { formatInputDate } from '../lib/input/formatInputDate';");
    expect(source).toContain("import { sanitizeInputValue } from '../lib/input/sanitizeInputValue';");
    expect(source).toContain('useEffect');
    expect(source).toContain('useRef');
    expect(source).toContain('const getControlledInputValue =');
    expect(source).toContain('const controlledInputChanged =');
    expect(source).toContain('if (isInputFocused && isInputDirty) {');
    expect(source).toContain('setRawInputValue(sanitizeInputValue(nextControlledInputValue));');
  });

  test('keeps validation priority format, range, external, required in one helper', () => {
    const source = dp.read('src/components/date-picker/model/validation.ts');

    expect(source).toContain('export interface DatePickerValidationInput');
    expect(source).toContain('export const getDatePickerValidationState');
    expect(source).toContain('resolveDatePickerValidationState');
    expect(source).toContain('isDateInRange');
    expect(source).toContain('formatInputDate');
    expect(source).toContain("return 'format';");
    expect(source).toContain("return 'range';");
    expect(source).toContain("return 'external';");
    expect(source).toContain("return 'required';");
    expect(source.indexOf("return 'format';") < source.indexOf("return 'range';")).toBe(true);
    expect(source.indexOf("return 'range';") < source.indexOf("return 'external';")).toBe(true);
    expect(source.indexOf("return 'external';") < source.indexOf("return 'required';")).toBe(true);
    expect(source).toContain('externalErrorMessage');
    expect(source).toContain('isVisible: input.isVisible ?? false');
    expect(source).toContain('isInvalid: errorType !== null');
  });

  test('marks validation state as invalid alongside visible error state', () => {
    const source = dp.read('src/components/date-picker/types/internal.types.ts');
    const hookSource = dp.read('src/components/date-picker/model/useDatePickerState.ts');

    expect(source).toContain('isInvalid: boolean;');
    expect(hookSource).toContain('isInvalid: false');
  });
});
