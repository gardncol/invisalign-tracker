import { format, startOfDay, endOfDay, differenceInDays } from 'date-fns';

export function getStartOfDay(date: Date): Date {
  return startOfDay(date);
}

export function getEndOfDay(date: Date): Date {
  return endOfDay(date);
}

export function formatHours(decimalHours: number): string {
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return `${hours}h ${minutes}m`;
}

export function isWithinAwakeHours(date: Date, awakeStart: string, awakeEnd: string): boolean {
  const timeStr = format(date, 'HH:mm');
  return timeStr >= awakeStart && timeStr <= awakeEnd;
}

export function getDaysBetween(start: Date, end: Date): number {
  return differenceInDays(end, start);
}

export function formatTimeOfDay(date: Date): string {
  return format(date, 'HH:mm');
}

export function toUTC(date: Date): number {
  return date.getTime();
}

export function fromUTC(timestamp: number): Date {
  return new Date(timestamp);
}

export function formatLongDate(date: Date): string {
  return format(date, 'EEEE, MMMM d');
}

export function formatShortDate(date: Date): string {
  return format(date, 'MMM d');
}

export function getDayOfWeek(date: Date): string {
  return format(date, 'EEEE');
}