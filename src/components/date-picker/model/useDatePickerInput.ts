import { useCallback, useEffect, useRef, useState } from 'react';

import { formatInputDate } from '../lib/input/formatInputDate';
import { parseInputDate } from '../lib/input/parseInputDate';
import { sanitizeInputValue } from '../lib/input/sanitizeInputValue';

import type { DatePickerInputController } from '../types/internal.types';
import type { DatePickerProps } from '../types/public.types';

const getControlledInputValue = (value: Date | null): string =>
  value ? formatInputDate(value) : '';

export default function useDatePickerInput(props: DatePickerProps): DatePickerInputController {
  const { onChange } = props;
  const controlledInputValue = getControlledInputValue(props.value);
  const [rawInputValue, setRawInputValue] = useState(controlledInputValue);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isInputDirty, setIsInputDirty] = useState(false);
  const previousControlledInputValue = useRef(controlledInputValue);
  const pendingControlledInputValue = useRef<string | null>(null);

  useEffect(() => {
    const nextControlledInputValue = getControlledInputValue(props.value);
    const controlledInputChanged = previousControlledInputValue.current !== nextControlledInputValue;

    if (!controlledInputChanged) {
      return;
    }

    previousControlledInputValue.current = nextControlledInputValue;

    if (isInputFocused && isInputDirty) {
      pendingControlledInputValue.current = nextControlledInputValue;
      return;
    }

    pendingControlledInputValue.current = null;
    setRawInputValue(sanitizeInputValue(nextControlledInputValue));
    setIsInputDirty(false);
  }, [isInputDirty, isInputFocused, props.value]);

  const handleInputChange = useCallback((nextValue: string) => {
    const sanitizedValue = sanitizeInputValue(nextValue);

    setRawInputValue(sanitizedValue);
    setIsInputDirty(true);

    const parsedInput = parseInputDate(sanitizedValue);

    if (parsedInput.status === 'valid') {
      onChange(parsedInput.date);
      return;
    }

    if (parsedInput.status === 'empty') {
      onChange(null);
    }
  }, [onChange]);

  const handleInputFocus = useCallback(() => {
    setIsInputFocused(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    setIsInputFocused(false);

    if (pendingControlledInputValue.current === null) {
      return;
    }

    setRawInputValue(sanitizeInputValue(pendingControlledInputValue.current));
    setIsInputDirty(false);
    pendingControlledInputValue.current = null;
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
