import { compareByDay } from './compareDates';

export const isSameDay = (left: Date, right: Date): boolean => compareByDay(left, right) === 0;
