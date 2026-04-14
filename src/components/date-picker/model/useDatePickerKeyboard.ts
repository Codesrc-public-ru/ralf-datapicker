import { useCallback, useEffect, useRef } from 'react';

import { selectDate } from './useDatePickerSelection';
import { KEYBOARD_KEYS } from '../constants/keyboard';
import {
  getEndDate,
  getHomeDate,
  getPageDownDate,
  getPageUpDate,
  getShiftPageDownDate,
  getShiftPageUpDate,
  moveDateByDays,
  moveDateByWeeks
} from '../lib/date/navigation';
import { normalizeDate } from '../lib/date/normalizeDate';

import type { DatePickerStateController } from '../types/internal.types';
import type { DatePickerProps } from '../types/public.types';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

interface KeyboardNavigationOptions {
  firstDayOfWeek?: number;
  shiftKey?: boolean;
}

interface KeyboardNavigationResolution {
  action: 'noop' | 'move-focus' | 'select-focused-date' | 'close-dialog';
  nextFocusedDate: Date | null;
  shouldSelectFocusedDate: boolean;
  shouldCloseDialog: boolean;
}

export interface DatePickerKeyboardController {
  handleGridKeyDown: (event: ReactKeyboardEvent<HTMLTableElement>) => void;
  handleDayFocus: (date: Date) => () => void;
  registerDayButton: (date: Date) => (element: HTMLButtonElement | null) => void;
}

interface DatePickerKeyboardOptions {
  controller: DatePickerStateController;
  closeDialog: () => void;
  disabledDates?: DatePickerProps['disabledDates'];
  firstDayOfWeek?: number;
  maxDate?: DatePickerProps['maxDate'];
  minDate?: DatePickerProps['minDate'];
  onChange: DatePickerProps['onChange'];
}

const createNeutralResolution = (): KeyboardNavigationResolution => ({
  action: 'noop',
  nextFocusedDate: null,
  shouldSelectFocusedDate: false,
  shouldCloseDialog: false
});

const getDateKey = (date: Date): string =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

const getMonthStart = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);

export const resolveKeyboardNavigation = (
  key: string,
  focusedDate: Date,
  options: KeyboardNavigationOptions = {}
): KeyboardNavigationResolution => {
  const firstDayOfWeek = options.firstDayOfWeek ?? 0;
  const shiftKey = options.shiftKey ?? false;

  switch (key) {
    case KEYBOARD_KEYS.ARROW_LEFT:
      return {
        action: 'move-focus',
        nextFocusedDate: moveDateByDays(focusedDate, -1),
        shouldSelectFocusedDate: false,
        shouldCloseDialog: false
      };
    case KEYBOARD_KEYS.ARROW_RIGHT:
      return {
        action: 'move-focus',
        nextFocusedDate: moveDateByDays(focusedDate, 1),
        shouldSelectFocusedDate: false,
        shouldCloseDialog: false
      };
    case KEYBOARD_KEYS.ARROW_UP:
      return {
        action: 'move-focus',
        nextFocusedDate: moveDateByWeeks(focusedDate, -1),
        shouldSelectFocusedDate: false,
        shouldCloseDialog: false
      };
    case KEYBOARD_KEYS.ARROW_DOWN:
      return {
        action: 'move-focus',
        nextFocusedDate: moveDateByWeeks(focusedDate, 1),
        shouldSelectFocusedDate: false,
        shouldCloseDialog: false
      };
    case KEYBOARD_KEYS.HOME:
      return {
        action: 'move-focus',
        nextFocusedDate: getHomeDate(focusedDate, firstDayOfWeek),
        shouldSelectFocusedDate: false,
        shouldCloseDialog: false
      };
    case KEYBOARD_KEYS.END:
      return {
        action: 'move-focus',
        nextFocusedDate: getEndDate(focusedDate, firstDayOfWeek),
        shouldSelectFocusedDate: false,
        shouldCloseDialog: false
      };
    case KEYBOARD_KEYS.PAGE_UP:
      return {
        action: 'move-focus',
        nextFocusedDate: shiftKey ? getShiftPageUpDate(focusedDate) : getPageUpDate(focusedDate),
        shouldSelectFocusedDate: false,
        shouldCloseDialog: false
      };
    case KEYBOARD_KEYS.PAGE_DOWN:
      return {
        action: 'move-focus',
        nextFocusedDate: shiftKey
          ? getShiftPageDownDate(focusedDate)
          : getPageDownDate(focusedDate),
        shouldSelectFocusedDate: false,
        shouldCloseDialog: false
      };
    case KEYBOARD_KEYS.ENTER:
    case KEYBOARD_KEYS.SPACE:
      return {
        action: 'select-focused-date',
        nextFocusedDate: focusedDate,
        shouldSelectFocusedDate: true,
        shouldCloseDialog: false
      };
    case KEYBOARD_KEYS.ESCAPE:
      return {
        action: 'close-dialog',
        nextFocusedDate: focusedDate,
        shouldSelectFocusedDate: false,
        shouldCloseDialog: true
      };
    default:
      return createNeutralResolution();
  }
};

export default function useDatePickerKeyboard({
  controller,
  closeDialog,
  disabledDates,
  firstDayOfWeek = 0,
  maxDate,
  minDate,
  onChange
}: DatePickerKeyboardOptions): DatePickerKeyboardController {
  const dayButtonRefs = useRef(new Map<string, HTMLButtonElement>());

  const focusDayButton = useCallback((date: Date | null) => {
    if (!date) {
      return;
    }

    const button = dayButtonRefs.current.get(getDateKey(date));

    if (!button) {
      return;
    }

    button.focus();
  }, []);

  useEffect(() => {
    if (!controller.state.isOpen || !controller.state.focusedDate) {
      return;
    }

    focusDayButton(controller.state.focusedDate);
  }, [controller.state.focusedDate, controller.state.isOpen, focusDayButton]);

  const registerDayButton = useCallback(
    (date: Date) => (element: HTMLButtonElement | null) => {
      const key = getDateKey(normalizeDate(date));

      if (element) {
        dayButtonRefs.current.set(key, element);
        return;
      }

      dayButtonRefs.current.delete(key);
    },
    []
  );

  const handleDayFocus = useCallback(
    (date: Date) => () => {
      const normalizedDate = normalizeDate(date);

      controller.setFocusedDate(normalizedDate);
      controller.setVisibleMonth(getMonthStart(normalizedDate));
    },
    [controller]
  );

  const handleGridKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLTableElement>) => {
      const focusedDate = controller.state.focusedDate;

      controller.setLastKeyPressed(event.key);

      if (!focusedDate) {
        return;
      }

      const resolution = resolveKeyboardNavigation(event.key, focusedDate, {
        firstDayOfWeek,
        shiftKey: event.shiftKey
      });

      if (resolution.action === 'noop' || !resolution.nextFocusedDate) {
        return;
      }

      event.preventDefault();

      if (resolution.shouldSelectFocusedDate) {
        selectDate(resolution.nextFocusedDate, {
          closeDialog,
          disabledDates,
          maxDate,
          minDate,
          onChange
        });
        return;
      }

      if (resolution.shouldCloseDialog) {
        closeDialog();
        return;
      }

      const nextFocusedDate = normalizeDate(resolution.nextFocusedDate);

      controller.setFocusedDate(nextFocusedDate);
      controller.setVisibleMonth(getMonthStart(nextFocusedDate));
      focusDayButton(nextFocusedDate);
    },
    [
      controller,
      closeDialog,
      disabledDates,
      firstDayOfWeek,
      focusDayButton,
      maxDate,
      minDate,
      onChange
    ]
  );

  return {
    handleGridKeyDown,
    handleDayFocus,
    registerDayButton
  };
}
