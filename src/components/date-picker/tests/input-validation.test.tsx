describe('Input helper layer', () => {
  test('keeps sanitize, parse, and format helpers together', () => {
    expect(dp.exists('src/components/date-picker/lib/input/sanitizeInputValue.ts')).toBe(true);
    expect(dp.exists('src/components/date-picker/lib/input/parseInputDate.ts')).toBe(true);
    expect(dp.exists('src/components/date-picker/lib/input/formatInputDate.ts')).toBe(true);
  });

  test('sanitizes pasted separators but keeps invalid draft text visible', () => {
    const source = dp.read('src/components/date-picker/lib/input/sanitizeInputValue.ts');

    expect(source).toContain("replace(SEPARATOR_PATTERN, '.')");
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
});
