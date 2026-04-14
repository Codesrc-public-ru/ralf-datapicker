// Pure functions only.
export const normalizeDate = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());
