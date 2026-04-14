const { default: DatePicker } = requireSource('src/components/date-picker/DatePicker.tsx');
const { getDayAriaLabel: getDayAriaLabelForDomStack } = requireSource(
  'src/components/date-picker/lib/a11y/getDayAriaLabel.ts'
);
const { getMonthYearLabel: getMonthYearLabelForDomStack } = requireSource(
  'src/components/date-picker/lib/i18n/getMonthYearLabel.ts'
);
const { getWeekdayNames: getWeekdayNamesForDomStack } = requireSource(
  'src/components/date-picker/lib/i18n/getWeekdayNames.ts'
);
const { getTriggerAriaLabel: getTriggerAriaLabelForDomStack } = requireSource(
  'src/components/date-picker/lib/a11y/getTriggerAriaLabel.ts'
);

describe('DatePicker DOM stack', () => {
  async function renderControlledDatePicker({
    disabled = false,
    disabledDates = [],
    initialValue = null,
    invalid = false,
    locale = 'en-US',
    maxDate = null,
    minDate = null
  } = {}) {
    const changeCalls = [];

    function ControlledDatePicker() {
      const [value, setValue] = React.useState(initialValue);

      return React.createElement(DatePicker, {
        disabled,
        invalid,
        locale,
        disabledDates,
        maxDate,
        minDate,
        onChange(nextValue) {
          changeCalls.push(nextValue);
          setValue(nextValue);
        },
        value
      });
    }

    await cleanup();
    const view = await render(React.createElement(ControlledDatePicker));

    return {
      changeCalls,
      ...view
    };
  }

  test('keeps min and max dates unavailable and blocks selection changes', async () => {
    const { changeCalls } = await renderControlledDatePicker({
      initialValue: new Date(2026, 4, 12),
      locale: 'en-US',
      maxDate: new Date(2026, 4, 20),
      minDate: new Date(2026, 4, 10)
    });

    const trigger = screen.getByRole('button', {
      name: getTriggerAriaLabelForDomStack(new Date(2026, 4, 12), 'en-US')
    });

    await user.click(trigger);

    const beforeMinButton = screen.getByRole('button', {
      name: getDayAriaLabelForDomStack(new Date(2026, 4, 9), {
        locale: 'en-US',
        unavailable: true
      })
    });
    const afterMaxButton = screen.getByRole('button', {
      name: getDayAriaLabelForDomStack(new Date(2026, 4, 21), {
        locale: 'en-US',
        unavailable: true
      })
    });

    expect(beforeMinButton).toBeDisabled();
    expect(afterMaxButton).toBeDisabled();

    await user.click(beforeMinButton);
    await user.click(afterMaxButton);

    expect(changeCalls).toHaveLength(0);
    expect(screen.getByLabelText('Date')).toHaveValue('12.05.2026');
    expect(screen.getByRole('dialog')).toBeVisible();
  });

  test('keeps disabledDates unavailable and blocks selection changes', async () => {
    const { changeCalls } = await renderControlledDatePicker({
      disabledDates: [new Date(2026, 4, 13)],
      initialValue: new Date(2026, 4, 12),
      locale: 'en-US'
    });

    await user.click(
      screen.getByRole('button', {
        name: getTriggerAriaLabelForDomStack(new Date(2026, 4, 12), 'en-US')
      })
    );

    const unavailableButton = screen.getByRole('button', {
      name: getDayAriaLabelForDomStack(new Date(2026, 4, 13), {
        locale: 'en-US',
        unavailable: true
      })
    });

    expect(unavailableButton).toBeDisabled();
    expect(unavailableButton).toHaveAttribute('aria-disabled', 'true');

    await user.click(unavailableButton);

    expect(changeCalls).toHaveLength(0);
    expect(screen.getByLabelText('Date')).toHaveValue('12.05.2026');
    expect(screen.getByRole('dialog')).toBeVisible();
  });

  test('opens the month for an out-of-range value and uses locale specific labels', async () => {
    await renderControlledDatePicker({
      initialValue: new Date(2026, 0, 15),
      locale: 'de-DE',
      maxDate: new Date(2026, 11, 31),
      minDate: new Date(2026, 4, 1)
    });

    const trigger = screen.getByRole('button', {
      name: getTriggerAriaLabelForDomStack(new Date(2026, 0, 15), 'de-DE')
    });

    await user.click(trigger);

    expect(screen.getByText(getMonthYearLabelForDomStack(new Date(2026, 0, 1), 'de-DE'))).toBeInTheDocument();
    expect(
      Array.from(document.querySelectorAll('th')).map((header) =>
        header.textContent?.trim() ?? ''
      ).join(',')
    ).toBe(getWeekdayNamesForDomStack('de-DE').join(','));
    expect(screen.getByRole('dialog')).toBeVisible();
  });

  test('renders user-event friendly flow with controlled sync and focus trap', async () => {
    await renderControlledDatePicker({
      initialValue: new Date(2026, 4, 12),
      locale: 'en-US'
    });
    const input = screen.getByLabelText('Date');
    const trigger = screen.getByRole('button', {
      name: getTriggerAriaLabelForDomStack(new Date(2026, 4, 12), 'en-US')
    });
    const liveRegion = screen.getByRole('status');

    expect(input).toHaveValue('12.05.2026');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(liveRegion).toHaveTextContent('');

    await user.click(trigger);

    const dialog = screen.getByRole('dialog');
    const monthLabel = getMonthYearLabelForDomStack(new Date(2026, 4, 1), 'en-US');

    expect(dialog).toBeVisible();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(liveRegion).toHaveTextContent(monthLabel);

    await user.tab();

    expect(dialog.contains(document.activeElement)).toBe(true);

    await user.click(
      screen.getByRole('button', {
        name: getDayAriaLabelForDomStack(new Date(2026, 4, 13), {
          locale: 'en-US'
        })
      })
    );

    expect(screen.queryByRole('dialog')).toBe(null);
    expect(input).toHaveValue('13.05.2026');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).toBe(null);
  });

  test('keeps visible state and initial value easy to assert', async () => {
    await renderControlledDatePicker({
      initialValue: new Date(2026, 4, 12),
      locale: 'en-US'
    });

    const input = screen.getByLabelText('Date');
    const trigger = screen.getByRole('button', {
      name: getTriggerAriaLabelForDomStack(new Date(2026, 4, 12), 'en-US')
    });

    expect(input).toBeInTheDocument();
    expect(trigger).toHaveTextContent('Open date picker');
    expect(screen.queryByRole('dialog')).toBe(null);
  });

  test('renders distinct selected, focused, unavailable, and outside-month day cell states', async () => {
    await renderControlledDatePicker({
      disabledDates: [new Date(2026, 4, 13)],
      initialValue: new Date(2026, 4, 12),
      locale: 'en-US'
    });

    await user.click(
      screen.getByRole('button', {
        name: getTriggerAriaLabelForDomStack(new Date(2026, 4, 12), 'en-US')
      })
    );

    const selectedButton = screen.getByRole('button', {
      name: getDayAriaLabelForDomStack(new Date(2026, 4, 12), {
        locale: 'en-US',
        selected: true
      })
    });
    const outsideMonthButton = screen.getByRole('button', {
      name: getDayAriaLabelForDomStack(new Date(2026, 3, 26), {
        locale: 'en-US',
        outsideMonth: true
      })
    });
    const unavailableButton = Array.from(document.querySelectorAll('button')).find(
      (button) => button.getAttribute('aria-label') === 'Wednesday, May 13, 2026, unavailable'
    );

    expect(selectedButton).toHaveFocus();
    expect(selectedButton.getAttribute('class') ?? '').toContain('selected');
    expect(selectedButton.getAttribute('class') ?? '').toContain('focused');

    expect(outsideMonthButton.getAttribute('class') ?? '').toContain('outsideMonth');

    expect(unavailableButton).toBeTruthy();
    expect(Boolean(unavailableButton?.disabled)).toBe(true);
    expect(unavailableButton.getAttribute('class') ?? '').toContain('disabled');
    expect(unavailableButton.getAttribute('aria-label') ?? '').toContain('unavailable');
  });
});
