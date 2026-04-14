import type { DatePickerInternalState } from '../types/internal.types';
import type { DatePickerProps } from '../types/public.types';

const createInitialState = (): DatePickerInternalState => ({
  isOpen: false,
  visibleMonth: null,
  focusedDate: null,
  rawInputValue: '',
  isInputFocused: false,
  isInputDirty: false,
  lastKeyPressed: null,
  focusTarget: null,
  isFocusInsideDialog: false,
  liveRegionMessage: '',
  validation: {
    errorType: null,
    errorMessage: null,
    isVisible: false,
    isInvalid: false
  }
});

export default function useDatePickerState(_props: DatePickerProps): DatePickerInternalState {
  return createInitialState();
}
