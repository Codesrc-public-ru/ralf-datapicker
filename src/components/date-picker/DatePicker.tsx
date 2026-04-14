import { useEffect, useRef } from 'react';

import { ACCESSIBILITY_CONSTANTS } from './constants/accessibility';
import styles from './DatePicker.module.css';
import { getDayAriaLabel } from './lib/a11y/getDayAriaLabel';
import { getDialogAriaProps } from './lib/a11y/getDialogAriaProps';
import { getInputDescribedBy } from './lib/a11y/getInputDescribedBy';
import { getLiveRegionMessage } from './lib/a11y/getLiveRegionMessage';
import { getTriggerAriaLabel } from './lib/a11y/getTriggerAriaLabel';
import { buildMonthMatrix } from './lib/date/buildMonthMatrix';
import { getToday } from './lib/date/getToday';
import { isDateDisabled } from './lib/date/isDateDisabled';
import { isSameDay } from './lib/date/isSameDay';
import { isSameMonth } from './lib/date/isSameMonth';
import { normalizeDate } from './lib/date/normalizeDate';
import { formatFullDateLabel } from './lib/i18n/formatFullDateLabel';
import { getFirstDayOfWeek } from './lib/i18n/getFirstDayOfWeek';
import { getMonthYearLabel } from './lib/i18n/getMonthYearLabel';
import { getWeekdayNames } from './lib/i18n/getWeekdayNames';
import { formatInputDate } from './lib/input/formatInputDate';
import { parseInputDate } from './lib/input/parseInputDate';
import useDatePickerFocus from './model/useDatePickerFocus';
import useDatePickerInput from './model/useDatePickerInput';
import useDatePickerKeyboard from './model/useDatePickerKeyboard';
import useDatePickerSelection from './model/useDatePickerSelection';
import useDatePickerState from './model/useDatePickerState';
import { getDatePickerValidationState } from './model/validation';
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

const getDisplayValue = (value: Date | null, draftValue: string, isDraftVisible: boolean): string =>
  isDraftVisible ? draftValue : value ? formatInputDate(value) : '';

export default function DatePicker(props: DatePickerProps) {
  const datePickerState = useDatePickerState(props);
  const { state, closeDialog, toggleDialog, setLiveRegionMessage, setValidation } = datePickerState;
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const previousSelectedValueRef = useRef<Date | null>(props.value ? normalizeDate(props.value) : null);
  const inputState = useDatePickerInput(props);
  const focusState = useDatePickerFocus();
  const keyboardState = useDatePickerKeyboard({
    closeDialog,
    controller: datePickerState,
    disabledDates: props.disabledDates,
    firstDayOfWeek: getFirstDayOfWeek(props.locale),
    locale: props.locale,
    maxDate: props.maxDate,
    minDate: props.minDate,
    onChange: props.onChange,
    setLiveRegionMessage: datePickerState.setLiveRegionMessage
  });
  const { handleDaySelect } = useDatePickerSelection({
    closeDialog,
    disabledDates: props.disabledDates,
    locale: props.locale,
    maxDate: props.maxDate,
    minDate: props.minDate,
    onChange: props.onChange,
    setLiveRegionMessage: datePickerState.setLiveRegionMessage
  });

  const displayValue = getDisplayValue(
    props.value,
    inputState.rawInputValue,
    inputState.isInputFocused || inputState.isInputDirty
  );
  const parsedInput = parseInputDate(inputState.rawInputValue);
  const validationState = getDatePickerValidationState({
    parsedInput,
    candidateDate: parsedInput.status === 'valid' ? parsedInput.date : props.value ? normalizeDate(props.value) : null,
    minDate: props.minDate,
    maxDate: props.maxDate,
    externalInvalid: props.invalid,
    externalErrorMessage: null,
    required: props.required,
    isVisible: props.invalid || (!inputState.isInputFocused && inputState.isInputDirty)
  });
  const isInvalid = props.invalid || (state.validation.isVisible && state.validation.isInvalid);
  const errorMessage = state.validation.isVisible ? state.validation.errorMessage : null;
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
    setValidation(validationState);
  }, [setValidation, validationState]);

  useEffect(() => {
    if (!state.isOpen && state.focusTarget === 'trigger') {
      triggerRef.current?.focus();
    }
  }, [state.focusTarget, state.isOpen]);

  useEffect(() => {
    const normalizedValue = props.value ? normalizeDate(props.value) : null;

    if (
      normalizedValue &&
      (!previousSelectedValueRef.current ||
        !isSameDay(previousSelectedValueRef.current, normalizedValue))
    ) {
      setLiveRegionMessage(getLiveRegionMessage(formatFullDateLabel(normalizedValue, props.locale), 'selected'));
    }

    previousSelectedValueRef.current = normalizedValue;
  }, [props.locale, props.value, setLiveRegionMessage]);

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
      <div
        aria-atomic="true"
        aria-live="polite"
        className={styles.liveRegion}
        id={ACCESSIBILITY_CONSTANTS.LIVE_REGION_ID}
        role="status"
      >
        {state.liveRegionMessage}
      </div>
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
