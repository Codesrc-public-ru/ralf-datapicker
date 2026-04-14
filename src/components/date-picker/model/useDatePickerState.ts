import { useCallback, useState } from 'react';

import { getToday } from '../lib/date/getToday';
import { isSameDay } from '../lib/date/isSameDay';
import { isSameMonth } from '../lib/date/isSameMonth';
import { normalizeDate } from '../lib/date/normalizeDate';

import type { DatePickerInternalState, DatePickerStateController } from '../types/internal.types';
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

const getDateOnly = (date: Date): Date => normalizeDate(date);

const getMonthStart = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);

const getInitialFocusedDate = (value: Date | null): Date => getDateOnly(value ?? getToday());

const getInitialVisibleMonth = (value: Date | null): Date =>
  getMonthStart(getInitialFocusedDate(value));

const getOpenState = (
  currentState: DatePickerInternalState,
  value: Date | null
): DatePickerInternalState => ({
  ...currentState,
  isOpen: true,
  visibleMonth: getInitialVisibleMonth(value),
  focusedDate: getInitialFocusedDate(value),
  focusTarget: 'grid',
  isFocusInsideDialog: true
});

const getClosedState = (currentState: DatePickerInternalState): DatePickerInternalState => ({
  ...currentState,
  isOpen: false,
  visibleMonth: null,
  focusedDate: null,
  focusTarget: 'trigger',
  isFocusInsideDialog: false
});

export default function useDatePickerState(props: DatePickerProps): DatePickerStateController {
  const [state, setState] = useState(createInitialState);

  const openDialog = useCallback(() => {
    setState((currentState) => {
      if (currentState.isOpen) {
        return currentState;
      }

      return getOpenState(currentState, props.value);
    });
  }, [props.value]);

  const closeDialog = useCallback(() => {
    setState((currentState) => {
      if (!currentState.isOpen) {
        return currentState;
      }

      return getClosedState(currentState);
    });
  }, []);

  const toggleDialog = useCallback(() => {
    setState((currentState) =>
      currentState.isOpen ? getClosedState(currentState) : getOpenState(currentState, props.value)
    );
  }, [props.value]);

  const setFocusedDate = useCallback((focusedDate: Date | null) => {
    setState((currentState) =>
      (currentState.focusedDate === focusedDate ||
        (currentState.focusedDate && focusedDate && isSameDay(currentState.focusedDate, focusedDate)))
        ? currentState
        : {
            ...currentState,
            focusedDate
          }
    );
  }, []);

  const setVisibleMonth = useCallback((visibleMonth: Date | null) => {
    setState((currentState) =>
      (currentState.visibleMonth === visibleMonth ||
        (currentState.visibleMonth &&
          visibleMonth &&
          isSameMonth(currentState.visibleMonth, visibleMonth)))
        ? currentState
        : {
            ...currentState,
            visibleMonth
          }
    );
  }, []);

  const setLastKeyPressed = useCallback((lastKeyPressed: string | null) => {
    setState((currentState) =>
      currentState.lastKeyPressed === lastKeyPressed
        ? currentState
        : {
            ...currentState,
            lastKeyPressed
          }
    );
  }, []);

  return {
    state,
    openDialog,
    closeDialog,
    toggleDialog,
    setFocusedDate,
    setVisibleMonth,
    setLastKeyPressed
  };
}
