import { useEffect, useRef } from 'react';

import styles from './DatePicker.module.css';
import { getDayAriaLabel } from './lib/a11y/getDayAriaLabel';
import { getDialogAriaProps } from './lib/a11y/getDialogAriaProps';
import { getInputDescribedBy } from './lib/a11y/getInputDescribedBy';
import { getTriggerAriaLabel } from './lib/a11y/getTriggerAriaLabel';
import { buildMonthMatrix } from './lib/date/buildMonthMatrix';
import { getToday } from './lib/date/getToday';
import { isDateDisabled } from './lib/date/isDateDisabled';
import { isSameDay } from './lib/date/isSameDay';
import { isSameMonth } from './lib/date/isSameMonth';
import { normalizeDate } from './lib/date/normalizeDate';
import { getFirstDayOfWeek } from './lib/i18n/getFirstDayOfWeek';
import { getMonthYearLabel } from './lib/i18n/getMonthYearLabel';
import { getWeekdayNames } from './lib/i18n/getWeekdayNames';
import { formatInputDate } from './lib/input/formatInputDate';
import useDatePickerFocus from './model/useDatePickerFocus';
import useDatePickerInput from './model/useDatePickerInput';
import useDatePickerKeyboard from './model/useDatePickerKeyboard';
import useDatePickerSelection from './model/useDatePickerSelection';
import useDatePickerState from './model/useDatePickerState';
import CalendarDayCell from './ui/CalendarDayCell';
import CalendarGrid from './ui/CalendarGrid';
import CalendarHeader from './ui/CalendarHeader';
import CalendarWeekdays from './ui/CalendarWeekdays';
import DatePickerDialog from './ui/DatePickerDialog';
import DatePickerError from './ui/DatePickerError';
import DatePickerField from './ui/DatePickerField';
import DatePickerTrigger from './ui/DatePickerTrigger';

import type { DatePickerProps } from './types/public.types';

const INPUT_ID = 'date-picker-input';
const ERROR_ID = 'date-picker-error';
const DIALOG_ID = 'date-picker-dialog';
const DIALOG_TITLE_ID = 'date-picker-dialog-title';
const FIELD_LABEL = 'Date';
const TRIGGER_LABEL = 'Open date picker';
const INVALID_MESSAGE = 'Invalid date';

const getDisplayValue = (value: Date | null, draftValue: string, isDraftVisible: boolean): string =>
  isDraftVisible ? draftValue : value ? formatInputDate(value) : '';

const getValidationMessage = (isInvalid: boolean, message: string | null): string | null =>
  message ?? (isInvalid ? INVALID_MESSAGE : null);

export default function DatePicker(props: DatePickerProps) {
  const datePickerState = useDatePickerState(props);
  const { state, closeDialog, toggleDialog } = datePickerState;
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const inputState = useDatePickerInput(props);
  const focusState = useDatePickerFocus();
  const keyboardState = useDatePickerKeyboard({
    closeDialog,
    controller: datePickerState,
    disabledDates: props.disabledDates,
    firstDayOfWeek: getFirstDayOfWeek(props.locale),
    maxDate: props.maxDate,
    minDate: props.minDate,
    onChange: props.onChange
  });
  const { handleDaySelect } = useDatePickerSelection({
    closeDialog,
    disabledDates: props.disabledDates,
    maxDate: props.maxDate,
    minDate: props.minDate,
    onChange: props.onChange
  });

  const displayValue = getDisplayValue(
    props.value,
    inputState.rawInputValue,
    inputState.isInputFocused || inputState.isInputDirty
  );
  const isInvalid = props.invalid || state.validation.isInvalid;
  const errorMessage = getValidationMessage(isInvalid, state.validation.errorMessage);
  const inputDescribedBy = getInputDescribedBy(errorMessage ? ERROR_ID : null);
  const dialogMonth = state.visibleMonth ?? props.value ?? getToday();
  const dialogMonthMatrix = buildMonthMatrix(
    dialogMonth.getFullYear(),
    dialogMonth.getMonth(),
    getFirstDayOfWeek(props.locale)
  );
  const weekdayLabels = getWeekdayNames(props.locale);
  const selectedDate = props.value ? normalizeDate(props.value) : null;
  const dialogAriaProps = getDialogAriaProps(state.isOpen, DIALOG_TITLE_ID);
  const selectionOptions = {
    disabledDates: props.disabledDates,
    maxDate: props.maxDate,
    minDate: props.minDate
  };

  useEffect(() => {
    if (!state.isOpen && state.focusTarget === 'trigger') {
      triggerRef.current?.focus();
    }
  }, [state.focusTarget, state.isOpen]);

  return (
    <div
      className={styles.root}
      data-focus-inside-dialog={focusState.isFocusInsideDialog || undefined}
      data-input-focused={inputState.isInputFocused || undefined}
      data-open={state.isOpen || undefined}
    >
      <DatePickerField invalid={isInvalid}>
        <input
          aria-describedby={inputDescribedBy || undefined}
          aria-invalid={isInvalid || undefined}
          aria-label={FIELD_LABEL}
          className={styles.input}
          disabled={props.disabled}
          id={INPUT_ID}
          onBlur={inputState.handleInputBlur}
          onChange={(event) => inputState.handleInputChange(event.currentTarget.value)}
          onFocus={inputState.handleInputFocus}
          readOnly={props.readOnly}
          required={props.required}
          type="text"
          value={displayValue}
        />
        <DatePickerTrigger
          aria-controls={DIALOG_ID}
          aria-expanded={state.isOpen}
          aria-haspopup="dialog"
          aria-label={getTriggerAriaLabel(props.value, props.locale)}
          disabled={props.disabled}
          ref={triggerRef}
          onClick={toggleDialog}
        >
          {TRIGGER_LABEL}
        </DatePickerTrigger>
      </DatePickerField>
      <DatePickerError id={ERROR_ID}>{errorMessage}</DatePickerError>
      <DatePickerDialog
        {...dialogAriaProps}
        id={DIALOG_ID}
        onKeyDown={focusState.handleDialogKeyDown}
        open={state.isOpen}
      >
        <CalendarHeader id={DIALOG_TITLE_ID} label={getMonthYearLabel(dialogMonth, props.locale)} />
        <CalendarGrid
          aria-labelledby={DIALOG_TITLE_ID}
          onKeyDown={keyboardState.handleGridKeyDown}
        >
          <CalendarWeekdays weekdayLabels={weekdayLabels} />
          <tbody>
            {dialogMonthMatrix.map((week, weekIndex) => (
              <tr key={`week-${weekIndex}`}>
                {week.map((day) => {
                  const outsideMonth = !isSameMonth(day, dialogMonth);
                  const selected = selectedDate ? isSameDay(day, selectedDate) : false;
                  const unavailable = isDateDisabled(day, selectionOptions);
                  const focused = state.focusedDate ? isSameDay(day, state.focusedDate) : false;

                  return (
                    <CalendarDayCell
                      key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
                      focused={focused}
                      outsideMonth={outsideMonth}
                      selected={selected}
                      unavailable={unavailable}
                      dayButtonProps={{
                        'aria-label': getDayAriaLabel(day, {
                          locale: props.locale,
                          selected,
                          unavailable,
                          outsideMonth
                        }),
                        onClick: () => handleDaySelect(day),
                        onFocus: keyboardState.handleDayFocus(day),
                        ref: keyboardState.registerDayButton(day),
                        tabIndex: focused ? 0 : -1
                      }}
                    >
                      {day.getDate()}
                    </CalendarDayCell>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </CalendarGrid>
      </DatePickerDialog>
    </div>
  );
}
