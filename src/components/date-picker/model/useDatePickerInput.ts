import type { DatePickerInputState } from '../types/internal.types';
import type { DatePickerProps } from '../types/public.types';

export default function useDatePickerInput(_props: DatePickerProps): DatePickerInputState {
  return {
    rawInputValue: '',
    isInputFocused: false,
    isInputDirty: false
  };
}
