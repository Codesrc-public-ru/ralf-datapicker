export type ValidationErrorType = 'format' | 'range' | 'external' | 'required' | null;

export interface DatePickerValidationState {
  errorType: ValidationErrorType;
  errorMessage: string | null;
  isVisible: boolean;
  isInvalid: boolean;
}

export interface DatePickerInputState {
  rawInputValue: string;
  isInputFocused: boolean;
  isInputDirty: boolean;
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
