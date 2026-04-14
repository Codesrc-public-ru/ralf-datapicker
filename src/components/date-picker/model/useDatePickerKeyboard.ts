import { useCallback, useEffect, useRef } from 'react';

import { selectDate } from './useDatePickerSelection';
import { KEYBOARD_KEYS } from '../constants/keyboard';
import { getLiveRegionMessage } from '../lib/a11y/getLiveRegionMessage';
import { isDateDisabled } from '../lib/date/isDateDisabled';
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
import { startOfMonth } from '../lib/date/startOfMonth';
import { getMonthYearLabel } from '../lib/i18n/getMonthYearLabel';

import type {
  DatePickerKeyboardController,
  DatePickerKeyboardNavigationOptions,
  DatePickerKeyboardNavigationResolution,
  DatePickerStateController
} from '../types/internal.types';
import type { DatePickerProps } from '../types/public.types';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

interface DatePickerKeyboardOptions {
  controller: DatePickerStateController;
  closeDialog: () => void;
  disabledDates?: DatePickerProps['disabledDates'];
  firstDayOfWeek?: number;
  locale?: DatePickerProps['locale'];
  maxDate?: DatePickerProps['maxDate'];
  minDate?: DatePickerProps['minDate'];
  onChange: DatePickerProps['onChange'];
  setLiveRegionMessage: (message: string) => void;
}

const createNeutralResolution = (): DatePickerKeyboardNavigationResolution => ({
  action: 'noop',
  nextFocusedDate: null,
  shouldSelectFocusedDate: false,
  shouldCloseDialog: false,
  shouldPreventDefault: false
});

const getDateKey = (date: Date): string =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

export const resolveKeyboardNavigation = (
  key: string,
  focusedDate: Date,
  options: DatePickerKeyboardNavigationOptions = {}
): DatePickerKeyboardNavigationResolution => {
  const firstDayOfWeek = options.firstDayOfWeek ?? 0;
  const shiftKey = options.shiftKey ?? false;
  const resolveMoveFocus = (nextFocusedDate: Date | null): DatePickerKeyboardNavigationResolution => {
    if (!nextFocusedDate || isDateDisabled(nextFocusedDate, options)) {
      return {
        ...createNeutralResolution(),
        shouldPreventDefault: true
      };
    }

    return {
      action: 'move-focus',
      nextFocusedDate,
      shouldSelectFocusedDate: false,
      shouldCloseDialog: false,
      shouldPreventDefault: true
    };
  };

  switch (key) {
    case KEYBOARD_KEYS.ARROW_LEFT:
      return resolveMoveFocus(moveDateByDays(focusedDate, -1));
    case KEYBOARD_KEYS.ARROW_RIGHT:
      return resolveMoveFocus(moveDateByDays(focusedDate, 1));
    case KEYBOARD_KEYS.ARROW_UP:
      return resolveMoveFocus(moveDateByWeeks(focusedDate, -1));
    case KEYBOARD_KEYS.ARROW_DOWN:
      return resolveMoveFocus(moveDateByWeeks(focusedDate, 1));
    case KEYBOARD_KEYS.HOME:
      return resolveMoveFocus(getHomeDate(focusedDate, firstDayOfWeek));
    case KEYBOARD_KEYS.END:
      return resolveMoveFocus(getEndDate(focusedDate, firstDayOfWeek));
    case KEYBOARD_KEYS.PAGE_UP:
      return resolveMoveFocus(shiftKey ? getShiftPageUpDate(focusedDate) : getPageUpDate(focusedDate));
    case KEYBOARD_KEYS.PAGE_DOWN:
      return resolveMoveFocus(
        shiftKey ? getShiftPageDownDate(focusedDate) : getPageDownDate(focusedDate)
      );
    case KEYBOARD_KEYS.ENTER:
    case KEYBOARD_KEYS.SPACE:
      return {
        action: 'select-focused-date',
        nextFocusedDate: focusedDate,
        shouldSelectFocusedDate: true,
        shouldCloseDialog: false,
        shouldPreventDefault: true
      };
    case KEYBOARD_KEYS.ESCAPE:
      return {
        action: 'close-dialog',
        nextFocusedDate: focusedDate,
        shouldSelectFocusedDate: false,
        shouldCloseDialog: true,
        shouldPreventDefault: true
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
  locale,
  maxDate,
  minDate,
  onChange,
  setLiveRegionMessage
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

  useEffect(() => {
    if (!controller.state.isOpen || !controller.state.visibleMonth) {
      return;
    }

    setLiveRegionMessage(
      getLiveRegionMessage(getMonthYearLabel(controller.state.visibleMonth, locale))
    );
  }, [controller.state.isOpen, controller.state.visibleMonth, locale, setLiveRegionMessage]);

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
      controller.setVisibleMonth(startOfMonth(normalizedDate));
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

      if (!resolution.shouldPreventDefault) {
        return;
      }

      event.preventDefault();

      if (resolution.action === 'noop' || !resolution.nextFocusedDate) {
        return;
      }

      if (resolution.shouldSelectFocusedDate) {
        selectDate(resolution.nextFocusedDate, {
          closeDialog,
          disabledDates,
          locale,
          maxDate,
          minDate,
          onChange,
          setLiveRegionMessage
        });
        return;
      }

      if (resolution.shouldCloseDialog) {
        closeDialog();
        return;
      }

      const nextFocusedDate = normalizeDate(resolution.nextFocusedDate);

      controller.setFocusedDate(nextFocusedDate);
      controller.setVisibleMonth(startOfMonth(nextFocusedDate));
      focusDayButton(nextFocusedDate);
    },
    [
      controller,
      closeDialog,
      disabledDates,
      firstDayOfWeek,
      focusDayButton,
      locale,
      maxDate,
      minDate,
      onChange,
      setLiveRegionMessage
    ]
  );

  return {
    handleGridKeyDown,
    handleDayFocus,
    registerDayButton
  };
}
