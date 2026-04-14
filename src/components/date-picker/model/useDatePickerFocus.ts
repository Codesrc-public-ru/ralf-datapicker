import { useCallback } from 'react';

import type { DatePickerFocusState } from '../types/internal.types';

export interface DatePickerFocusController extends DatePickerFocusState {
  handleDialogKeyDown: (event: DialogKeyDownEvent) => void;
}

interface DialogKeyDownEvent {
  currentTarget: HTMLDivElement;
  key: string;
  preventDefault: () => void;
  shiftKey: boolean;
}

const getFocusableButtons = (dialog: HTMLDivElement): HTMLButtonElement[] =>
  Array.from(dialog.querySelectorAll<HTMLButtonElement>('button:not([disabled])'));

const focusButtonAtIndex = (buttons: HTMLButtonElement[], index: number): void => {
  buttons[index]?.focus();
};

export default function useDatePickerFocus(): DatePickerFocusController {
  const handleDialogKeyDown = useCallback((event: DialogKeyDownEvent) => {
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
