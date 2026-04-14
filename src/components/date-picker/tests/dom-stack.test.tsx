const { default: DatePicker } = requireSource('src/components/date-picker/DatePicker.tsx');
const { getDayAriaLabel: getDayAriaLabelForDomStack } = requireSource(
  'src/components/date-picker/lib/a11y/getDayAriaLabel.ts'
);
const { getMonthYearLabel: getMonthYearLabelForDomStack } = requireSource(
  'src/components/date-picker/lib/i18n/getMonthYearLabel.ts'
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
    locale = 'en-US'
  } = {}) {
    const changeCalls = [];

    function ControlledDatePicker() {
      const [value, setValue] = React.useState(initialValue);

      return React.createElement(DatePicker, {
        disabled,
        invalid,
        locale,
        disabledDates,
        onChange(nextValue) {
          changeCalls.push(nextValue);
          setValue(nextValue);
        },
        value
      });
    }

    const view = await render(React.createElement(ControlledDatePicker));

    return {
      changeCalls,
      ...view
    };
  }

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
