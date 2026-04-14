describe('Keyboard integration scaffold', () => {
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

  test('keeps keyboard constants centralized', () => {
    const source = dp.read('src/components/date-picker/constants/keyboard.ts');

    expect(source).toContain("ENTER: 'Enter'");
    expect(source).toContain("ESCAPE: 'Escape'");
    expect(source).toContain("ARROW_LEFT: 'ArrowLeft'");
    expect(source).toContain("ARROW_RIGHT: 'ArrowRight'");
    expect(source).toContain("ARROW_UP: 'ArrowUp'");
    expect(source).toContain("ARROW_DOWN: 'ArrowDown'");
    expect(source).toContain("HOME: 'Home'");
    expect(source).toContain("END: 'End'");
    expect(source).toContain("PAGE_UP: 'PageUp'");
    expect(source).toContain("PAGE_DOWN: 'PageDown'");
    expect(source).toContain("SPACE: ' '");
  });

  test('keeps keyboard state hook in the model layer', () => {
    const source = dp.read('src/components/date-picker/model/useDatePickerKeyboard.ts');

    expect(source).toContain('useDatePickerKeyboard');
    expect(source).toContain('resolveKeyboardNavigation');
    expect(source).toContain("import { isDateDisabled } from '../lib/date/isDateDisabled';");
    expect(source).toContain('handleGridKeyDown');
    expect(source).toContain('handleDayFocus');
    expect(source).toContain('registerDayButton');
    expect(source).toContain('moveDateByDays');
    expect(source).toContain('moveDateByWeeks');
    expect(source).toContain('getHomeDate');
    expect(source).toContain('getEndDate');
    expect(source).toContain('getPageUpDate');
    expect(source).toContain('getPageDownDate');
    expect(source).toContain('getShiftPageUpDate');
    expect(source).toContain('getShiftPageDownDate');
    expect(source).toContain('shouldPreventDefault');
  });

  test('wires keyboard handling into the calendar grid and day cells', () => {
    const source = dp.read('src/components/date-picker/DatePicker.tsx');

    expect(source).toContain('const keyboardState = useDatePickerKeyboard({');
    expect(source).toContain('onKeyDown={keyboardState.handleGridKeyDown}');
    expect(source).toContain('onFocus: keyboardState.handleDayFocus(day)');
    expect(source).toContain('ref: keyboardState.registerDayButton(day)');
    expect(source).toContain('tabIndex: focused ? 0 : -1');
  });

  test('maps every supported key to the expected calendar action', () => {
    const KEYBOARD_KEYS = {
      ARROW_DOWN: 'ArrowDown',
      ARROW_LEFT: 'ArrowLeft',
      ARROW_RIGHT: 'ArrowRight',
      ARROW_UP: 'ArrowUp',
      END: 'End',
      ENTER: 'Enter',
      ESCAPE: 'Escape',
      HOME: 'Home',
      PAGE_DOWN: 'PageDown',
      PAGE_UP: 'PageUp',
      SPACE: ' '
    };

    const calls = [];
    const makeDate = (day) => new Date(2026, 2, day);
    const focusedDate = makeDate(15);

    const deps = {
      isDateDisabled: () => false,
      KEYBOARD_KEYS,
      moveDateByDays: (_date, amount) => {
        calls.push(['days', amount]);
        return makeDate(15 + amount);
      },
      moveDateByWeeks: (_date, amount) => {
        calls.push(['weeks', amount]);
        return makeDate(15 + amount * 7);
      },
      getHomeDate: (_date, firstDayOfWeek) => {
        calls.push(['home', firstDayOfWeek]);
        return makeDate(firstDayOfWeek + 1);
      },
      getEndDate: (_date, firstDayOfWeek) => {
        calls.push(['end', firstDayOfWeek]);
        return makeDate(firstDayOfWeek + 7);
      },
      getPageUpDate: (_date) => {
        calls.push(['month', -1]);
        return makeDate(5);
      },
      getPageDownDate: (_date) => {
        calls.push(['month', 1]);
        return makeDate(25);
      },
      getShiftPageUpDate: (_date) => {
        calls.push(['year', -1]);
        return makeDate(9);
      },
      getShiftPageDownDate: (_date) => {
        calls.push(['year', 1]);
        return makeDate(21);
      }
    };

    const { resolveKeyboardNavigation } = loadModule(
      'src/components/date-picker/model/useDatePickerKeyboard.ts',
      ['resolveKeyboardNavigation'],
      deps
    );

    const scenarios = [
      {
        key: KEYBOARD_KEYS.ARROW_LEFT,
        expectedAction: 'move-focus',
        expectedCall: ['days', -1],
        expectedDay: 14,
        expectedPreventDefault: true
      },
      {
        key: KEYBOARD_KEYS.ARROW_RIGHT,
        expectedAction: 'move-focus',
        expectedCall: ['days', 1],
        expectedDay: 16,
        expectedPreventDefault: true
      },
      {
        key: KEYBOARD_KEYS.ARROW_UP,
        expectedAction: 'move-focus',
        expectedCall: ['weeks', -1],
        expectedDay: 8,
        expectedPreventDefault: true
      },
      {
        key: KEYBOARD_KEYS.ARROW_DOWN,
        expectedAction: 'move-focus',
        expectedCall: ['weeks', 1],
        expectedDay: 22,
        expectedPreventDefault: true
      },
      {
        key: KEYBOARD_KEYS.HOME,
        expectedAction: 'move-focus',
        expectedCall: ['home', 1],
        expectedDay: 2,
        expectedPreventDefault: true
      },
      {
        key: KEYBOARD_KEYS.END,
        expectedAction: 'move-focus',
        expectedCall: ['end', 1],
        expectedDay: 8,
        expectedPreventDefault: true
      },
      {
        key: KEYBOARD_KEYS.PAGE_UP,
        expectedAction: 'move-focus',
        expectedCall: ['month', -1],
        expectedDay: 5,
        expectedPreventDefault: true
      },
      {
        key: KEYBOARD_KEYS.PAGE_DOWN,
        expectedAction: 'move-focus',
        expectedCall: ['month', 1],
        expectedDay: 25,
        expectedPreventDefault: true
      },
      {
        key: KEYBOARD_KEYS.PAGE_UP,
        shiftKey: true,
        expectedAction: 'move-focus',
        expectedCall: ['year', -1],
        expectedDay: 9,
        expectedPreventDefault: true
      },
      {
        key: KEYBOARD_KEYS.PAGE_DOWN,
        shiftKey: true,
        expectedAction: 'move-focus',
        expectedCall: ['year', 1],
        expectedDay: 21,
        expectedPreventDefault: true
      },
      {
        key: KEYBOARD_KEYS.ENTER,
        expectedAction: 'select-focused-date',
        expectedCall: null,
        expectedDay: 15,
        shouldSelectFocusedDate: true,
        expectedPreventDefault: true
      },
      {
        key: KEYBOARD_KEYS.SPACE,
        expectedAction: 'select-focused-date',
        expectedCall: null,
        expectedDay: 15,
        shouldSelectFocusedDate: true,
        expectedPreventDefault: true
      },
      {
        key: KEYBOARD_KEYS.ESCAPE,
        expectedAction: 'close-dialog',
        expectedCall: null,
        expectedDay: 15,
        shouldCloseDialog: true,
        expectedPreventDefault: true
      }
    ];

    for (const scenario of scenarios) {
      calls.length = 0;
      const result = resolveKeyboardNavigation(scenario.key, focusedDate, {
        firstDayOfWeek: 1,
        shiftKey: Boolean(scenario.shiftKey)
      });

      expect(result.action).toBe(scenario.expectedAction);
      expect(result.nextFocusedDate.getDate()).toBe(scenario.expectedDay);
      expect(result.shouldSelectFocusedDate).toBe(Boolean(scenario.shouldSelectFocusedDate));
      expect(result.shouldCloseDialog).toBe(Boolean(scenario.shouldCloseDialog));
      expect(result.shouldPreventDefault).toBe(Boolean(scenario.expectedPreventDefault));
      if (scenario.expectedCall) {
        expect(calls).toEqual([scenario.expectedCall]);
      } else {
        expect(calls).toEqual([]);
      }
    }
  });

  test('keeps keyboard focus stable when the next day is disabled', () => {
    const KEYBOARD_KEYS = {
      ARROW_LEFT: 'ArrowLeft',
      ARROW_RIGHT: 'ArrowRight',
      ARROW_UP: 'ArrowUp',
      ARROW_DOWN: 'ArrowDown',
      END: 'End',
      ENTER: 'Enter',
      ESCAPE: 'Escape',
      HOME: 'Home',
      PAGE_DOWN: 'PageDown',
      PAGE_UP: 'PageUp',
      SPACE: ' '
    };

    const { resolveKeyboardNavigation } = loadModule(
      'src/components/date-picker/model/useDatePickerKeyboard.ts',
      ['resolveKeyboardNavigation'],
      {
        isDateDisabled: (date) => date.getDate() === 16,
        KEYBOARD_KEYS,
        getEndDate: (date) => date,
        getHomeDate: (date) => date,
        getPageDownDate: (date) => date,
        getPageUpDate: (date) => date,
        getShiftPageDownDate: (date) => date,
        getShiftPageUpDate: (date) => date,
        moveDateByDays: (_date, amount) => new Date(2026, 2, 15 + amount),
        moveDateByWeeks: (_date, amount) => new Date(2026, 2, 15 + amount * 7)
      }
    );

    const result = resolveKeyboardNavigation(KEYBOARD_KEYS.ARROW_RIGHT, new Date(2026, 2, 15));

    expect(result.action).toBe('noop');
    expect(result.nextFocusedDate).toBe(null);
    expect(result.shouldPreventDefault).toBe(true);
    expect(result.shouldSelectFocusedDate).toBe(false);
    expect(result.shouldCloseDialog).toBe(false);
  });
});
