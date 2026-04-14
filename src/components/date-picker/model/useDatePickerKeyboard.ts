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

const createNeutralResolution = () => ({
  action: 'noop',
  nextFocusedDate: null,
  shouldSelectFocusedDate: false,
  shouldCloseDialog: false
});

export const resolveKeyboardNavigation = (key, focusedDate, options = {}) => {
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
        nextFocusedDate: shiftKey
          ? getShiftPageUpDate(focusedDate)
          : getPageUpDate(focusedDate),
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

export default function useDatePickerKeyboard(_props) {
  void _props;

  return {
    lastKeyPressed: null
  };
}
