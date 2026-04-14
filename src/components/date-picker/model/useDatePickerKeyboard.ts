import type { DatePickerKeyboardState } from '../types/internal.types';
import type { DatePickerProps } from '../types/public.types';

export default function useDatePickerKeyboard(_props: DatePickerProps): DatePickerKeyboardState {
  return {
    lastKeyPressed: null
  };
}
