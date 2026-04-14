describe('Keyboard integration scaffold', () => {
  function loadModule(relativePath, exportNames, deps = {}) {
    const source = dp.read(relativePath);
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
    expect(source).toContain('moveDateByDays');
    expect(source).toContain('moveDateByWeeks');
    expect(source).toContain('getHomeDate');
    expect(source).toContain('getEndDate');
    expect(source).toContain('getPageUpDate');
    expect(source).toContain('getPageDownDate');
    expect(source).toContain('getShiftPageUpDate');
    expect(source).toContain('getShiftPageDownDate');
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
      KEYBOARD_KEYS,
      moveDateByDays: (date, amount) => {
        calls.push(['days', amount]);
        return makeDate(date.getDate() + amount);
      },
      moveDateByWeeks: (date, amount) => {
        calls.push(['weeks', amount]);
        return makeDate(date.getDate() + amount * 7);
      },
      getHomeDate: (date, firstDayOfWeek) => {
        calls.push(['home', firstDayOfWeek]);
        return makeDate(firstDayOfWeek + 1);
      },
      getEndDate: (date, firstDayOfWeek) => {
        calls.push(['end', firstDayOfWeek]);
        return makeDate(firstDayOfWeek + 7);
      },
      getPageUpDate: (date) => {
        calls.push(['month', -1]);
        return makeDate(5);
      },
      getPageDownDate: (date) => {
        calls.push(['month', 1]);
        return makeDate(25);
      },
      getShiftPageUpDate: (date) => {
        calls.push(['year', -1]);
        return makeDate(9);
      },
      getShiftPageDownDate: (date) => {
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
        expectedDay: 14
      },
      {
        key: KEYBOARD_KEYS.ARROW_RIGHT,
        expectedAction: 'move-focus',
        expectedCall: ['days', 1],
        expectedDay: 16
      },
      {
        key: KEYBOARD_KEYS.ARROW_UP,
        expectedAction: 'move-focus',
        expectedCall: ['weeks', -1],
        expectedDay: 8
      },
      {
        key: KEYBOARD_KEYS.ARROW_DOWN,
        expectedAction: 'move-focus',
        expectedCall: ['weeks', 1],
        expectedDay: 22
      },
      {
        key: KEYBOARD_KEYS.HOME,
        expectedAction: 'move-focus',
        expectedCall: ['home', 1],
        expectedDay: 2
      },
      {
        key: KEYBOARD_KEYS.END,
        expectedAction: 'move-focus',
        expectedCall: ['end', 1],
        expectedDay: 8
      },
      {
        key: KEYBOARD_KEYS.PAGE_UP,
        expectedAction: 'move-focus',
        expectedCall: ['month', -1],
        expectedDay: 5
      },
      {
        key: KEYBOARD_KEYS.PAGE_DOWN,
        expectedAction: 'move-focus',
        expectedCall: ['month', 1],
        expectedDay: 25
      },
      {
        key: KEYBOARD_KEYS.PAGE_UP,
        shiftKey: true,
        expectedAction: 'move-focus',
        expectedCall: ['year', -1],
        expectedDay: 9
      },
      {
        key: KEYBOARD_KEYS.PAGE_DOWN,
        shiftKey: true,
        expectedAction: 'move-focus',
        expectedCall: ['year', 1],
        expectedDay: 21
      },
      {
        key: KEYBOARD_KEYS.ENTER,
        expectedAction: 'select-focused-date',
        expectedCall: null,
        expectedDay: 15,
        shouldSelectFocusedDate: true
      },
      {
        key: KEYBOARD_KEYS.SPACE,
        expectedAction: 'select-focused-date',
        expectedCall: null,
        expectedDay: 15,
        shouldSelectFocusedDate: true
      },
      {
        key: KEYBOARD_KEYS.ESCAPE,
        expectedAction: 'close-dialog',
        expectedCall: null,
        expectedDay: 15,
        shouldCloseDialog: true
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
      if (scenario.expectedCall) {
        expect(calls).toEqual([scenario.expectedCall]);
      } else {
        expect(calls).toEqual([]);
      }
    }
  });
});
