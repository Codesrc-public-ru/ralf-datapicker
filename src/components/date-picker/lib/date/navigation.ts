import { addDays } from './addDays';
import { addMonths } from './addMonths';
import { addYears } from './addYears';
import { startOfWeek } from './startOfWeek';

export const moveDateByDays = (date: Date, amount: number): Date => addDays(date, amount);

export const moveDateByWeeks = (date: Date, amount: number): Date => addDays(date, amount * 7);

export const moveDateByMonths = (date: Date, amount: number): Date => addMonths(date, amount);

export const moveDateByYears = (date: Date, amount: number): Date => addYears(date, amount);

export const getHomeDate = (date: Date, firstDayOfWeek = 0): Date =>
  startOfWeek(date, firstDayOfWeek);

export const getEndDate = (date: Date, firstDayOfWeek = 0): Date =>
  addDays(startOfWeek(date, firstDayOfWeek), 6);

export const getPageUpDate = (date: Date): Date => addMonths(date, -1);

export const getPageDownDate = (date: Date): Date => addMonths(date, 1);

export const getShiftPageUpDate = (date: Date): Date => addYears(date, -1);

export const getShiftPageDownDate = (date: Date): Date => addYears(date, 1);
