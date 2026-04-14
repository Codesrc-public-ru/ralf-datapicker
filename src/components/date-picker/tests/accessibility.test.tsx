describe('Accessibility scaffold', () => {
  test('keeps aria helpers centralized in lib/a11y', () => {
    const files = [
      'src/components/date-picker/lib/a11y/getDialogAriaProps.ts',
      'src/components/date-picker/lib/a11y/getDayAriaLabel.ts',
      'src/components/date-picker/lib/a11y/getInputDescribedBy.ts',
      'src/components/date-picker/lib/a11y/getLiveRegionMessage.ts',
      'src/components/date-picker/lib/a11y/getTriggerAriaLabel.ts'
    ];

    for (const file of files) {
      expect(dp.exists(file)).toBe(true);
    }
  });

  test('keeps dialog aria semantics explicit in the helper stub', () => {
    const source = dp.read('src/components/date-picker/lib/a11y/getDialogAriaProps.ts');

    expect(source).toContain("'aria-modal': 'true'");
    expect(source).toContain("'role': 'dialog'");
  });

  test('keeps day labels and live region output deterministic', () => {
    const dayLabel = dp.read('src/components/date-picker/lib/a11y/getDayAriaLabel.ts');
    const liveRegion = dp.read('src/components/date-picker/lib/a11y/getLiveRegionMessage.ts');
    const triggerLabel = dp.read('src/components/date-picker/lib/a11y/getTriggerAriaLabel.ts');

    expect(dayLabel).toContain("'Day Label'");
    expect(liveRegion).toContain('message: string');
    expect(triggerLabel).toContain("'Date Picker Trigger'");
  });
});
