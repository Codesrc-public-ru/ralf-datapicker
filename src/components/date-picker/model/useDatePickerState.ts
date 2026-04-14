import { useCallback, useState } from 'react';

import { getToday } from '../lib/date/getToday';
import { isSameDay } from '../lib/date/isSameDay';
import { isSameMonth } from '../lib/date/isSameMonth';
import { normalizeDate } from '../lib/date/normalizeDate';
import { startOfMonth } from '../lib/date/startOfMonth';

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

const getInitialFocusedDate = (value: Date | null): Date => getDateOnly(value ?? getToday());

const getInitialVisibleMonth = (value: Date | null): Date =>
  startOfMonth(getInitialFocusedDate(value));

const shouldKeepFocusedDate = (currentDate: Date | null, nextDate: Date | null): boolean =>
  !currentDate && !nextDate ? true : !!(currentDate && nextDate && isSameDay(currentDate, nextDate));

const shouldKeepVisibleMonth = (currentMonth: Date | null, nextMonth: Date | null): boolean =>
  !currentMonth && !nextMonth
    ? true
    : !!(currentMonth && nextMonth && isSameMonth(currentMonth, nextMonth));

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
      shouldKeepFocusedDate(currentState.focusedDate, focusedDate)
        ? currentState
        : {
            ...currentState,
            focusedDate
          }
    );
  }, []);

  const setVisibleMonth = useCallback((visibleMonth: Date | null) => {
    setState((currentState) =>
      shouldKeepVisibleMonth(currentState.visibleMonth, visibleMonth)
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

  const setLiveRegionMessage = useCallback((liveRegionMessage: string) => {
    setState((currentState) =>
      currentState.liveRegionMessage === liveRegionMessage
        ? currentState
        : {
            ...currentState,
            liveRegionMessage
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
    setLastKeyPressed,
    setLiveRegionMessage
  };
}
