import { useCallback, useEffect, useRef, useState } from 'react';

import { formatInputDate } from '../lib/input/formatInputDate';
import { sanitizeInputValue } from '../lib/input/sanitizeInputValue';

import type { DatePickerInputState } from '../types/internal.types';
import type { DatePickerProps } from '../types/public.types';

const getControlledInputValue = (value: Date | null): string =>
  value ? formatInputDate(value) : '';

export interface DatePickerInputController extends DatePickerInputState {
  handleInputChange: (nextValue: string) => void;
  handleInputFocus: () => void;
  handleInputBlur: () => void;
}

export default function useDatePickerInput(props: DatePickerProps): DatePickerInputController {
  const controlledInputValue = getControlledInputValue(props.value);
  const [rawInputValue, setRawInputValue] = useState(controlledInputValue);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isInputDirty, setIsInputDirty] = useState(false);
  const previousControlledInputValue = useRef(controlledInputValue);

  useEffect(() => {
    const nextControlledInputValue = getControlledInputValue(props.value);
    const controlledInputChanged = previousControlledInputValue.current !== nextControlledInputValue;

    if (!controlledInputChanged) {
      return;
    }

    previousControlledInputValue.current = nextControlledInputValue;

    if (isInputFocused && isInputDirty) {
      return;
    }

    setRawInputValue(sanitizeInputValue(nextControlledInputValue));
    setIsInputDirty(false);
  }, [isInputDirty, isInputFocused, props.value]);

  const handleInputChange = useCallback((nextValue: string) => {
    setRawInputValue(sanitizeInputValue(nextValue));
    setIsInputDirty(true);
  }, []);

  const handleInputFocus = useCallback(() => {
    setIsInputFocused(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    setIsInputFocused(false);
  }, []);

  return {
    rawInputValue,
    isInputFocused,
    isInputDirty,
    handleInputChange,
    handleInputFocus,
    handleInputBlur
  };
}
