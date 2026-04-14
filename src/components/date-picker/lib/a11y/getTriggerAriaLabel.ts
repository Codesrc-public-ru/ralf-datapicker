import { formatFullDateLabel } from '../i18n/formatFullDateLabel';

const DEFAULT_LOCALE = Intl.DateTimeFormat().resolvedOptions().locale;

export const getTriggerAriaLabel = (value, locale = DEFAULT_LOCALE) => {
  if (!value) {
    return 'Choose date';
  }

  return `Change date, selected ${formatFullDateLabel(value, locale)}`;
};
