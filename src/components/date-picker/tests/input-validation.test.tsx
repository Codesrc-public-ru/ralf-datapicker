describe('Input helper scaffold', () => {
  test('keeps sanitize, parse, and format helpers together', () => {
    expect(dp.exists('src/components/date-picker/lib/input/sanitizeInputValue.ts')).toBe(true);
    expect(dp.exists('src/components/date-picker/lib/input/parseInputDate.ts')).toBe(true);
    expect(dp.exists('src/components/date-picker/lib/input/formatInputDate.ts')).toBe(true);
  });

  test('keeps the canonical DD.MM.YYYY format in the formatter stub', () => {
    const source = dp.read('src/components/date-picker/lib/input/formatInputDate.ts');

    expect(source).toContain("'DD.MM.YYYY'");
    expect(source).toContain('export const formatInputDate');
  });

  test('keeps input helpers pure and side-effect free', () => {
    const source = dp.read('src/components/date-picker/lib/input/sanitizeInputValue.ts').toLowerCase();

    expect(source).not.toContain('document');
    expect(source).not.toContain('window');
  });
});
