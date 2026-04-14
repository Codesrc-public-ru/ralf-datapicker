import { formatFullDateLabel } from '../i18n/formatFullDateLabel';

const DEFAULT_LOCALE = Intl.DateTimeFormat().resolvedOptions().locale;

export const getTriggerAriaLabel = (value: Date | null, locale: string = DEFAULT_LOCALE): string => {
  if (!value) {
    return 'Choose date';
  }

  return `Change date, selected ${formatFullDateLabel(value, locale)}`;
};
