import type { DatePickerFocusState } from '../types/internal.types';
import type { DatePickerProps } from '../types/public.types';

export default function useDatePickerFocus(_props: DatePickerProps): DatePickerFocusState {
  return {
    focusTarget: null,
    isFocusInsideDialog: false
  };
}
