const DEFAULT_LOCALE = Intl.DateTimeFormat().resolvedOptions().locale;

const REGION_FIRST_DAY = {
  AE: 6,
  AF: 6,
  BH: 6,
  DZ: 6,
  EG: 6,
  IR: 6,
  IQ: 6,
  IL: 0,
  JP: 0,
  KW: 6,
  LY: 6,
  OM: 6,
  QA: 6,
  SA: 6,
  SY: 6,
  US: 0,
  YE: 6
};

const normalizeDayIndex = (day) => {
  const normalized = day % 7;
  return normalized < 0 ? normalized + 7 : normalized;
};

const getLocaleWeekInfoFirstDay = (locale) => {
  try {
    const weekInfo = new Intl.Locale(locale).weekInfo;

    if (typeof weekInfo?.firstDay !== 'number') {
      return null;
    }

    return normalizeDayIndex(weekInfo.firstDay);
  } catch {
    return null;
  }
};

const getLocaleRegion = (locale) => {
  const match = locale.match(/-([a-z]{2}|\d{3})(?:-|$)/i);
  return match ? match[1].toUpperCase() : null;
};

export const getFirstDayOfWeek = (locale = DEFAULT_LOCALE) => {
  const effectiveLocale = locale || DEFAULT_LOCALE;
  const firstDayOfWeek = getLocaleWeekInfoFirstDay(effectiveLocale);
  if (firstDayOfWeek !== null) {
    return firstDayOfWeek;
  }

  const region = getLocaleRegion(effectiveLocale);
  if (region && Object.prototype.hasOwnProperty.call(REGION_FIRST_DAY, region)) {
    return REGION_FIRST_DAY[region];
  }

  return 0;
};
