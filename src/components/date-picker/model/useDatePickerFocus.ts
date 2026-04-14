import { useCallback } from 'react';

import type { DatePickerDialogKeyDownEvent, DatePickerFocusController } from '../types/internal.types';

const getFocusableButtons = (dialog: HTMLDivElement): HTMLButtonElement[] =>
  Array.from(dialog.querySelectorAll<HTMLButtonElement>('button:not([disabled])'));

const focusButtonAtIndex = (buttons: HTMLButtonElement[], index: number): void => {
  buttons[index]?.focus();
};

export default function useDatePickerFocus(): DatePickerFocusController {
  const handleDialogKeyDown = useCallback((event: DatePickerDialogKeyDownEvent) => {
    if (event.key !== 'Tab') {
      return;
    }

    if (typeof document === 'undefined') {
      return;
    }

    const dialog = event.currentTarget;
    const buttons = getFocusableButtons(dialog);

    if (!buttons.length) {
      return;
    }

    const activeElement = document.activeElement;
    const currentIndex = buttons.findIndex((button) => button === activeElement);

    event.preventDefault();

    if (event.shiftKey) {
      const previousIndex = currentIndex <= 0 ? buttons.length - 1 : currentIndex - 1;

      focusButtonAtIndex(buttons, previousIndex);
      return;
    }

    const nextIndex = currentIndex < 0 || currentIndex === buttons.length - 1 ? 0 : currentIndex + 1;

    focusButtonAtIndex(buttons, nextIndex);
  }, []);

  return {
    focusTarget: null,
    isFocusInsideDialog: false,
    handleDialogKeyDown
  };
}
