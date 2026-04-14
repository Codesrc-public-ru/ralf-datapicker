const { default: DatePickerForControlledSync } = requireSource(
  'src/components/date-picker/DatePicker.tsx'
);

describe('Controlled sync integration', () => {
  async function renderControlledDatePicker({
    externalInvalid = false,
    externalValue = null
  } = {}) {
    const changeCalls = [];

    function ControlledDatePicker({
      externalInvalid: nextExternalInvalid = false,
      externalValue: nextExternalValue = null
    }) {
      const [value, setValue] = React.useState(nextExternalValue);
      const [invalid, setInvalid] = React.useState(nextExternalInvalid);

      React.useEffect(() => {
        setValue(nextExternalValue);
      }, [nextExternalValue]);

      React.useEffect(() => {
        setInvalid(nextExternalInvalid);
      }, [nextExternalInvalid]);

      return React.createElement(DatePickerForControlledSync, {
        invalid,
        locale: 'en-US',
        onChange(nextValue) {
          changeCalls.push(nextValue);
          setValue(nextValue);
        },
        value
      });
    }

    await cleanup();

    const view = await render(
      React.createElement(ControlledDatePicker, {
        externalInvalid,
        externalValue
      })
    );

    return {
      changeCalls,
      rerender: (nextProps = {}) =>
        view.rerender(
          React.createElement(ControlledDatePicker, {
            externalInvalid,
            externalValue,
            ...nextProps
          })
        )
    };
  }

  test('keeps a focused draft while the controlled value changes, then syncs on blur', async () => {
    const { rerender, changeCalls } = await renderControlledDatePicker();
    const input = screen.getByLabelText('Date');

    await user.type(input, '31.02.2026');

    expect(changeCalls).toHaveLength(0);
    expect(input).toHaveValue('31.02.2026');

    await rerender({
      externalValue: new Date(2026, 4, 20)
    });

    await user.tab();

    expect(input).toHaveValue('20.05.2026');
    expect(input).not.toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByText('Use DD.MM.YYYY')).toBe(null);
  });

  test('shows blur validation for an invalid manual date', async () => {
    await renderControlledDatePicker();
    const input = screen.getByLabelText('Date');

    await user.type(input, '31.02.2026');
    await user.tab();

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'date-picker-error');
    expect(screen.getByText('Use DD.MM.YYYY')).toBeInTheDocument();
  });

  test('clears the input when the controlled value becomes null', async () => {
    const { rerender } = await renderControlledDatePicker({
      externalValue: new Date(2026, 4, 20)
    });
    const input = screen.getByLabelText('Date');

    await rerender({
      externalValue: null
    });

    expect(input).toHaveValue('');
  });
});
