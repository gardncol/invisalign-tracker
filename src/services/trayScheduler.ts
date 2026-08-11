import type { UserProfile } from '../types';
import { addDays } from 'date-fns';

/**
 * Calculate the next tray change date.
 * Uses the actual last change date (not the originally scheduled date)
 * to implement day-drift: if user was 2 days late, next change shifts by 2 days.
 */
export function calculateNextChangeDate(
  lastChangeDate: Date,
  changeFrequencyDays: number
): Date {
  return addDays(lastChangeDate, changeFrequencyDays);
}

/**
 * Calculate estimated treatment completion date.
 * Based on remaining trays × change frequency, added to today.
 */
export function calculateEstimatedCompletionDate(
  user: UserProfile,
  today: Date
): Date {
  const remaining = getTraysRemaining(user);
  const totalDays = remaining * user.changeFrequencyDays;
  return addDays(today, totalDays);
}

/**
 * Get number of trays remaining (including current).
 */
export function getTraysRemaining(user: UserProfile): number {
  return user.totalTrays - user.currentTray + 1;
}

/**
 * Get tray progress as a percentage.
 */
export function getTrayProgressPct(user: UserProfile): number {
  return Math.round(((user.currentTray - 1) / user.totalTrays) * 100);
}

/**
 * Check if today is a tray-change day.
 */
export function isTrayChangeDay(
  lastChangeDate: Date,
  changeFrequencyDays: number,
  today: Date
): boolean {
  const nextChange = calculateNextChangeDate(lastChangeDate, changeFrequencyDays);
  return (
    nextChange.getDate() === today.getDate() &&
    nextChange.getMonth() === today.getMonth() &&
    nextChange.getFullYear() === today.getFullYear()
  );
}

/**
 * Detect if a tray change was missed (scheduled date passed without confirmation).
 */
export function isTrayChangeOverdue(
  lastChangeDate: Date,
  changeFrequencyDays: number,
  today: Date
): boolean {
  const nextChange = calculateNextChangeDate(lastChangeDate, changeFrequencyDays);
  // Overdue if more than 24 hours past scheduled change time
  const overdueThreshold = new Date(nextChange.getTime() + 24 * 60 * 60 * 1000);
  return today > overdueThreshold;
}