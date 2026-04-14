const { default: DatePicker } = requireSource('src/components/date-picker/DatePicker.tsx');
const { getTriggerAriaLabel } = requireSource(
  'src/components/date-picker/lib/a11y/getTriggerAriaLabel.ts'
);

describe('DatePicker DOM stack', () => {
  async function renderControlledDatePicker({
    disabled = false,
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
    await renderControlledDatePicker();
    const input = screen.getByLabelText('Date');
    const trigger = screen.getByRole('button', {
      name: getTriggerAriaLabel(null, 'en-US')
    });

    expect(input).toHaveValue('');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.type(input, '12.05.2026');

    expect(input).toHaveValue('12.05.2026');

    await user.click(trigger);

    const dialog = screen.getByRole('dialog');

    expect(dialog).toBeVisible();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.tab();

    expect(dialog.contains(document.activeElement)).toBe(true);

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
      name: getTriggerAriaLabel(new Date(2026, 4, 12), 'en-US')
    });

    expect(input).toBeInTheDocument();
    expect(trigger).toHaveTextContent('Open date picker');
    expect(screen.queryByRole('dialog')).toBe(null);
  });
});
