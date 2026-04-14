import { formatFullDateLabel } from '../i18n/formatFullDateLabel';

const DEFAULT_LOCALE = Intl.DateTimeFormat().resolvedOptions().locale;

interface DayAriaLabelOptions {
  locale?: string;
  selected?: boolean;
  unavailable?: boolean;
  outsideMonth?: boolean;
}

const buildDayStateLabel = (options: DayAriaLabelOptions | undefined): string[] => {
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

export const getDayAriaLabel = (date: Date, options: DayAriaLabelOptions = {}): string => {
  const locale = options.locale ?? DEFAULT_LOCALE;
  const dayLabel = formatFullDateLabel(date, locale);
  const stateLabels = buildDayStateLabel(options);

  if (stateLabels.length === 0) {
    return dayLabel;
  }

  return `${dayLabel}, ${stateLabels.join(', ')}`;
};
