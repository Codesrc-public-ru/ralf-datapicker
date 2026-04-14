import { FORMATS } from '../constants/formats';
import { isDateInRange } from '../lib/date/isDateInRange';
import { formatInputDate } from '../lib/input/formatInputDate';

import type { ParsedInputDate } from '../lib/input/parseInputDate';
import type { DatePickerValidationState, ValidationErrorType } from '../types/internal.types';

export type { DatePickerValidationState, ValidationErrorType } from '../types/internal.types';

export interface DatePickerValidationInput {
  parsedInput: ParsedInputDate;
  candidateDate: Date | null;
  minDate?: Date | null;
  maxDate?: Date | null;
  externalInvalid?: boolean;
  externalErrorMessage?: string | null;
  required?: boolean;
  isVisible?: boolean;
}

const VALIDATION_MESSAGES: Record<Exclude<ValidationErrorType, null>, string> = {
  format: `Use ${FORMATS.INPUT}`,
  range: 'Choose a date within the allowed range',
  external: 'Date is invalid',
  required: 'Date is required'
};

const isFormatValidationError = (parsedInput: ParsedInputDate): boolean =>
  parsedInput.status === 'format' || parsedInput.status === 'calendar';

const getRangeValidationMessage = (minDate?: Date | null, maxDate?: Date | null): string => {
  if (minDate && maxDate) {
    return `Choose a date between ${formatInputDate(minDate)} and ${formatInputDate(maxDate)}`;
  }

  if (minDate) {
    return `Choose a date on or after ${formatInputDate(minDate)}`;
  }

  if (maxDate) {
    return `Choose a date on or before ${formatInputDate(maxDate)}`;
  }

  return VALIDATION_MESSAGES.range;
};

const getValidationErrorMessage = (
  errorType: ValidationErrorType,
  input: DatePickerValidationInput
): string | null => {
  switch (errorType) {
    case 'format':
      return VALIDATION_MESSAGES.format;
    case 'range':
      return getRangeValidationMessage(input.minDate, input.maxDate);
    case 'external':
      return input.externalErrorMessage?.trim() || VALIDATION_MESSAGES.external;
    case 'required':
      return VALIDATION_MESSAGES.required;
    default:
      return null;
  }
};

const getValidationErrorType = (input: DatePickerValidationInput): ValidationErrorType => {
  if (isFormatValidationError(input.parsedInput)) {
    return 'format';
  }

  if (input.parsedInput.status === 'valid') {
    const dateToValidate = input.candidateDate ?? input.parsedInput.date;
    if (dateToValidate && !isDateInRange(dateToValidate, input.minDate, input.maxDate)) {
      return 'range';
    }
  }

  if (input.externalInvalid) {
    return 'external';
  }

  if (input.required && input.parsedInput.status === 'empty') {
    return 'required';
  }

  return null;
};

export const getDatePickerValidationState = (
  input: DatePickerValidationInput
): DatePickerValidationState => {
  const errorType = getValidationErrorType(input);

  return {
    errorType,
    errorMessage: getValidationErrorMessage(errorType, input),
    isVisible: input.isVisible ?? false,
    isInvalid: errorType !== null
  };
};

export const resolveDatePickerValidationState = getDatePickerValidationState;
