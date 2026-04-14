import { sanitizeInputValue } from './sanitizeInputValue';

export type InputDateParseStatus = 'empty' | 'partial' | 'valid' | 'format' | 'calendar';

export type InputDateParseErrorType = 'format' | 'calendar' | null;

export interface ParsedInputDate {
  status: InputDateParseStatus;
  date: Date | null;
  errorType: InputDateParseErrorType;
  isComplete: boolean;
  isPartial: boolean;
  isValid: boolean;
}

const FULL_INPUT_PATTERN = /^\d{2}\.\d{2}\.\d{4}$/;
const PARTIAL_INPUT_PATTERN = /^\d{0,2}(?:\.\d{0,2})?(?:\.\d{0,4})?$/;
const DATE_PART_SEPARATOR = '.';

const createLocalDate = (year: number, monthIndex: number, day: number): Date =>
  new Date(year, monthIndex, day);

const isValidCalendarDate = (year: number, month: number, day: number): boolean => {
  const candidateDate = createLocalDate(year, month - 1, day);

  return (
    candidateDate.getFullYear() === year &&
    candidateDate.getMonth() === month - 1 &&
    candidateDate.getDate() === day
  );
};

const parsePart = (text: string): number => Number(text);

export const parseInputDate = (text: string): ParsedInputDate => {
  const sanitizedValue = sanitizeInputValue(text);

  if (sanitizedValue.length === 0) {
    return {
      status: 'empty',
      date: null,
      errorType: null,
      isComplete: false,
      isPartial: false,
      isValid: false
    };
  }

  if (FULL_INPUT_PATTERN.test(sanitizedValue)) {
    const [dayText, monthText, yearText] = sanitizedValue.split(DATE_PART_SEPARATOR);
    const day = parsePart(dayText);
    const month = parsePart(monthText);
    const year = parsePart(yearText);

    if (!isValidCalendarDate(year, month, day)) {
      return {
        status: 'calendar',
        date: null,
        errorType: 'calendar',
        isComplete: true,
        isPartial: false,
        isValid: false
      };
    }

    return {
      status: 'valid',
      date: createLocalDate(year, month - 1, day),
      errorType: null,
      isComplete: true,
      isPartial: false,
      isValid: true
    };
  }

  if (PARTIAL_INPUT_PATTERN.test(sanitizedValue)) {
    return {
      status: 'partial',
      date: null,
      errorType: null,
      isComplete: false,
      isPartial: true,
      isValid: false
    };
  }

  return {
    status: 'format',
    date: null,
    errorType: 'format',
    isComplete: true,
    isPartial: false,
    isValid: false
  };
};
