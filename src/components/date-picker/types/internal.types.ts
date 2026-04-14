export type ValidationErrorType = 'format' | 'range' | 'external' | 'required' | null;

export interface DatePickerInternalState {
  isOpen: boolean;
  visibleMonth: Date | null;
  focusedDate: Date | null;
  rawInputValue: string;
  isInputFocused: boolean;
  liveRegionMessage: string;
  validationErrorType: ValidationErrorType;
}
