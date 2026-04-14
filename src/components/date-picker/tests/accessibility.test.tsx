describe('Accessibility helpers', () => {
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
      .replace(/^\s*import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];\s*$/gm, (_, names) => {
        return `const { ${names} } = deps;`;
      })
      .replace(/^\s*export\s+/gm, '');

    return new Function(
      'deps',
      `${transformed}\nreturn { ${exportNames.join(', ')} };`
    )(deps);
  }

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

  test('formats trigger labels for empty and selected values', () => {
    const { formatFullDateLabel } = loadModule(
      'src/components/date-picker/lib/i18n/formatFullDateLabel.ts',
      ['formatFullDateLabel']
    );
    const { getTriggerAriaLabel } = loadModule(
      'src/components/date-picker/lib/a11y/getTriggerAriaLabel.ts',
      ['getTriggerAriaLabel'],
      { formatFullDateLabel }
    );

    const selectedDate = new Date(2026, 4, 1, 22, 30);

    expect(getTriggerAriaLabel(null, 'en-US')).toBe('Choose date');
    expect(getTriggerAriaLabel(selectedDate, 'en-US')).toBe(
      `Change date, selected ${formatFullDateLabel(selectedDate, 'en-US')}`
    );
  });

  test('formats day labels with selected, unavailable, and outside month states', () => {
    const { formatFullDateLabel } = loadModule(
      'src/components/date-picker/lib/i18n/formatFullDateLabel.ts',
      ['formatFullDateLabel']
    );
    const { getDayAriaLabel } = loadModule(
      'src/components/date-picker/lib/a11y/getDayAriaLabel.ts',
      ['getDayAriaLabel'],
      { formatFullDateLabel }
    );

    const date = new Date(2026, 4, 1, 18, 15);

    expect(getDayAriaLabel(date, { locale: 'en-US' })).toBe(formatFullDateLabel(date, 'en-US'));
    expect(getDayAriaLabel(date, { locale: 'en-US', selected: true })).toBe(
      `${formatFullDateLabel(date, 'en-US')}, selected`
    );
    expect(getDayAriaLabel(date, { locale: 'en-US', unavailable: true, outsideMonth: true })).toBe(
      `${formatFullDateLabel(date, 'en-US')}, unavailable, outside current month`
    );
  });

  test('composes describedBy ids and live region text deterministically', () => {
    const { getInputDescribedBy } = loadModule(
      'src/components/date-picker/lib/a11y/getInputDescribedBy.ts',
      ['getInputDescribedBy']
    );
    const { getLiveRegionMessage } = loadModule(
      'src/components/date-picker/lib/a11y/getLiveRegionMessage.ts',
      ['getLiveRegionMessage']
    );

    expect(getInputDescribedBy('error-id', ' help-id ', '', 'error-id', null)).toBe('error-id help-id');
    expect(getLiveRegionMessage('  May 2026  ', '', 'selected date updated', null)).toBe(
      'May 2026 selected date updated'
    );
  });

  test('returns dialog semantics explicitly and hides closed dialogs', () => {
    const { getDialogAriaProps } = loadModule(
      'src/components/date-picker/lib/a11y/getDialogAriaProps.ts',
      ['getDialogAriaProps']
    );

    expect(getDialogAriaProps(true)).toEqual({
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'date-picker-dialog-title'
    });
    expect(getDialogAriaProps(false, 'custom-title')).toEqual({
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'custom-title',
      hidden: true
    });
  });
});
