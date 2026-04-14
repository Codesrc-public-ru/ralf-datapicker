// Pure functions only.
export const isDateDisabled = (date: Date, disabledDates?: Date[] | ((date: Date) => boolean)): boolean => false;
