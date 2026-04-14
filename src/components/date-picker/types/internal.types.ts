import type { DatePickerDisabledDates, DatePickerProps } from './public.types';
import type { ParsedInputDate } from '../lib/input/parseInputDate';
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  Ref,
  TableHTMLAttributes
} from 'react';

export type ValidationErrorType = 'format' | 'range' | 'external' | 'required' | null;

export interface DatePickerValidationState {
  errorType: ValidationErrorType;
  errorMessage: string | null;
  isVisible: boolean;
  isInvalid: boolean;
}

export interface DatePickerValidationInput {
  parsedInput: ParsedInputDate;
  candidateDate: Date | null;
  minDate?: Date | null;
  maxDate?: Date | null;
  externalInvalid?: boolean;
  externalErrorMessage: string | null;
  required?: boolean;
  isVisible?: boolean;
}

export interface DatePickerInputState {
  rawInputValue: string;
  isInputFocused: boolean;
  isInputDirty: boolean;
}

export interface DatePickerInputController extends DatePickerInputState {
  handleInputChange: (nextValue: string) => void;
  handleInputFocus: () => void;
  handleInputBlur: () => void;
}

export interface DatePickerCalendarState {
  isOpen: boolean;
  visibleMonth: Date | null;
  focusedDate: Date | null;
}

export interface DatePickerKeyboardState {
  lastKeyPressed: string | null;
}

export interface DatePickerFocusState {
  focusTarget: 'input' | 'trigger' | 'grid' | null;
  isFocusInsideDialog: boolean;
}

export interface DatePickerDialogKeyDownEvent {
  currentTarget: HTMLDivElement;
  key: string;
  preventDefault: () => void;
  shiftKey: boolean;
}

export interface DatePickerFocusController extends DatePickerFocusState {
  handleDialogKeyDown: (event: DatePickerDialogKeyDownEvent) => void;
}

export interface DatePickerKeyboardNavigationOptions {
  firstDayOfWeek?: number;
  disabledDates?: DatePickerDisabledDates;
  maxDate?: DatePickerProps['maxDate'] | null;
  minDate?: DatePickerProps['minDate'] | null;
  shiftKey?: boolean;
}

export interface DatePickerKeyboardNavigationResolution {
  action: 'noop' | 'move-focus' | 'select-focused-date' | 'close-dialog';
  nextFocusedDate: Date | null;
  shouldSelectFocusedDate: boolean;
  shouldCloseDialog: boolean;
  shouldPreventDefault: boolean;
}

export interface DatePickerKeyboardController {
  handleGridKeyDown: (event: ReactKeyboardEvent<HTMLTableElement>) => void;
  handleDayFocus: (date: Date) => () => void;
  registerDayButton: (date: Date) => (element: HTMLButtonElement | null) => void;
}

export interface DatePickerLiveRegionState {
  liveRegionMessage: string;
}

export interface DatePickerInternalState
  extends DatePickerInputState,
    DatePickerCalendarState,
    DatePickerKeyboardState,
    DatePickerFocusState,
    DatePickerLiveRegionState {
  validation: DatePickerValidationState;
}

export interface DatePickerStateController {
  state: DatePickerInternalState;
  openDialog: () => void;
  closeDialog: () => void;
  toggleDialog: () => void;
  setFocusedDate: (date: Date | null) => void;
  setVisibleMonth: (date: Date | null) => void;
  setLastKeyPressed: (key: string | null) => void;
  setLiveRegionMessage: (message: string) => void;
}

export interface DateSelectionOptions {
  closeDialog: () => void;
  disabledDates?: DatePickerDisabledDates;
  maxDate?: DatePickerProps['maxDate'] | null;
  minDate?: DatePickerProps['minDate'] | null;
  locale?: DatePickerProps['locale'];
  onChange: DatePickerProps['onChange'];
  setLiveRegionMessage: (message: string) => void;
}

export interface DatePickerFieldProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  invalid?: boolean;
}

export interface DatePickerTriggerProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode;
}

export interface DatePickerDialogProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  open?: boolean;
}

export interface CalendarHeaderProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  label: ReactNode;
}

export interface CalendarWeekdaysProps extends HTMLAttributes<HTMLTableSectionElement> {
  weekdayLabels: readonly ReactNode[];
}

export interface CalendarGridProps extends TableHTMLAttributes<HTMLTableElement> {
  children: ReactNode;
  caption?: ReactNode;
}

export interface DatePickerErrorProps extends HTMLAttributes<HTMLParagraphElement> {
  children?: ReactNode;
}

export type DatePickerDayButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  ref?: Ref<HTMLButtonElement>;
};

export interface CalendarDayCellProps extends HTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
  dayButtonProps: DatePickerDayButtonProps;
  focused?: boolean;
  outsideMonth?: boolean;
  selected?: boolean;
  unavailable?: boolean;
}
