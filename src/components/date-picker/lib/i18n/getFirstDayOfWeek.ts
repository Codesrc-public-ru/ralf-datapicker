const DEFAULT_LOCALE = Intl.DateTimeFormat().resolvedOptions().locale;

const getLocaleWeekInfoFirstDay = (locale: string): number | null => {
  try {
    const weekInfo = new Intl.Locale(locale).weekInfo;

    if (typeof weekInfo?.firstDay !== 'number') {
      return null;
    }

    return weekInfo.firstDay % 7;
  } catch {
    return null;
  }
};

const getLocaleRegion = (locale: string): string | null => {
  const match = locale.match(/-([a-z]{2}|\d{3})(?:-|$)/i);
  return match ? match[1].toUpperCase() : null;
};

const REGION_FIRST_DAY: Record<string, number> = {
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

export const getFirstDayOfWeek = (year: number, month: number): number => {
  void year;
  void month;

  const firstDayOfWeek = getLocaleWeekInfoFirstDay(DEFAULT_LOCALE);
  if (firstDayOfWeek !== null) {
    return firstDayOfWeek;
  }

  const region = getLocaleRegion(DEFAULT_LOCALE);
  if (region && region in REGION_FIRST_DAY) {
    return REGION_FIRST_DAY[region];
  }

  return 0;
};
