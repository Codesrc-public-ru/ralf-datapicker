const DEFAULT_LABEL_ID = 'date-picker-dialog-title';

export const getDialogAriaProps = (isOpen, labelId = DEFAULT_LABEL_ID) => ({
  role: 'dialog',
  'aria-modal': 'true',
  'aria-labelledby': labelId,
  ...(isOpen ? {} : { hidden: true })
});
