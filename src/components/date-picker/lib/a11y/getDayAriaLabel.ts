import { formatFullDateLabel } from '../i18n/formatFullDateLabel';

const DEFAULT_LOCALE = Intl.DateTimeFormat().resolvedOptions().locale;

const buildDayStateLabel = (options) => {
  const stateLabels = [];

  if (options?.selected) {
    stateLabels.push('selected');
  }

  if (options?.unavailable) {
    stateLabels.push('unavailable');
  }

  if (options?.outsideMonth) {
    stateLabels.push('outside current month');
  }

  return stateLabels;
};

export const getDayAriaLabel = (date, options = {}) => {
  const locale = options.locale ?? DEFAULT_LOCALE;
  const dayLabel = formatFullDateLabel(date, locale);
  const stateLabels = buildDayStateLabel(options);

  if (stateLabels.length === 0) {
    return dayLabel;
  }

  return `${dayLabel}, ${stateLabels.join(', ')}`;
};
