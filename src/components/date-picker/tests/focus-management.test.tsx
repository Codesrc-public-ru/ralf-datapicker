describe('Focus integration scaffold', () => {
  test('keeps focus state in the model layer', () => {
    const source = dp.read('src/components/date-picker/model/useDatePickerFocus.ts');

    expect(source).toContain('useDatePickerFocus');
    expect(source).toContain('focusTarget: null');
    expect(source).toContain('isFocusInsideDialog: false');
  });

  test('keeps dialog state separate from the UI layer', () => {
    const source = dp.read('src/components/date-picker/ui/DatePickerDialog.tsx');

    expect(source).toContain('role="dialog"');
    expect(source).toContain('aria-modal="true"');
    expect(source).toContain('hidden={!open}');
    expect(source).not.toContain('useDatePickerFocus');
    expect(source).not.toContain('useDatePickerKeyboard');
  });
});
