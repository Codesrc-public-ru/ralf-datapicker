describe('Keyboard integration scaffold', () => {
  test('keeps keyboard constants centralized', () => {
    const source = dp.read('src/components/date-picker/constants/keyboard.ts');

    expect(source).toContain("ENTER: 'Enter'");
    expect(source).toContain("ESCAPE: 'Escape'");
  });

  test('keeps keyboard state hook in the model layer', () => {
    const source = dp.read('src/components/date-picker/model/useDatePickerKeyboard.ts');

    expect(source).toContain('useDatePickerKeyboard');
    expect(source).toContain('DatePickerKeyboardState');
  });
});
