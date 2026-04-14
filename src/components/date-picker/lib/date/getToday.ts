import { normalizeDate } from './normalizeDate';

// Pure functions only.
export const getToday = (): Date => normalizeDate(new Date());
