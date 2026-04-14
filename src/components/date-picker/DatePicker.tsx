import styles from './DatePicker.module.css';
import { getInputDescribedBy } from './lib/a11y/getInputDescribedBy';
import { getTriggerAriaLabel } from './lib/a11y/getTriggerAriaLabel';
import { formatInputDate } from './lib/input/formatInputDate';
import useDatePickerFocus from './model/useDatePickerFocus';
import useDatePickerInput from './model/useDatePickerInput';
import useDatePickerState from './model/useDatePickerState';
import DatePickerError from './ui/DatePickerError';
import DatePickerField from './ui/DatePickerField';
import DatePickerTrigger from './ui/DatePickerTrigger';

import type { DatePickerProps } from './types/public.types';

const INPUT_ID = 'date-picker-input';
const ERROR_ID = 'date-picker-error';
const FIELD_LABEL = 'Date';
const TRIGGER_LABEL = 'Open date picker';
const INVALID_MESSAGE = 'Invalid date';

const getDisplayValue = (value: Date | null, draftValue: string): string =>
  value ? formatInputDate(value) : draftValue;

const getValidationMessage = (isInvalid: boolean, message: string | null): string | null =>
  message ?? (isInvalid ? INVALID_MESSAGE : null);

export default function DatePicker(props: DatePickerProps) {
  const state = useDatePickerState(props);
  const inputState = useDatePickerInput(props);
  const focusState = useDatePickerFocus(props);

  const displayValue = getDisplayValue(props.value, inputState.rawInputValue);
  const isInvalid = props.invalid || state.validation.isInvalid;
  const errorMessage = getValidationMessage(isInvalid, state.validation.errorMessage);
  const inputDescribedBy = getInputDescribedBy(errorMessage ? ERROR_ID : null);

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
          onChange={() => undefined}
          readOnly
          required={props.required}
          type="text"
          value={displayValue}
        />
        <DatePickerTrigger
          aria-label={getTriggerAriaLabel(props.value, props.locale)}
          disabled={props.disabled}
        >
          {TRIGGER_LABEL}
        </DatePickerTrigger>
      </DatePickerField>
      <DatePickerError id={ERROR_ID}>{errorMessage}</DatePickerError>
    </div>
  );
}
