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
 * Calculate the next tray change date accounting for a specific day-of-week preference.
 * If trayChangeDay is -1, just uses the frequency interval.
 * If trayChangeDay is 0-6 (Sun-Sat), finds the next occurrence of that day
 * that is at least changeFrequencyDays away from the last change.
 */
export function calculateNextChangeDateWithDay(
  lastChangeDate: Date,
  changeFrequencyDays: number,
  trayChangeDay: number,
  trayChangeTime: string
): Date {
  if (trayChangeDay < 0 || trayChangeDay > 6) {
    // No specific day — use simple interval
    return addDays(lastChangeDate, changeFrequencyDays);
  }

  // Find the next occurrence of the target day-of-week that is >= changeFrequencyDays away
  const minDate = addDays(lastChangeDate, changeFrequencyDays);

  const candidate = new Date(minDate);
  const currentDay = candidate.getDay();
  let diff = trayChangeDay - currentDay;
  if (diff < 0) diff += 7;

  candidate.setDate(candidate.getDate() + diff);

  // If candidate ended up before minDate (shouldn't happen, but safety check), add a week
  if (candidate < minDate) {
    candidate.setDate(candidate.getDate() + 7);
  }

  // Set the time
  const [hours, minutes] = trayChangeTime.split(':').map(Number);
  candidate.setHours(hours, minutes, 0, 0);

  return candidate;
}

/**
 * Calculate estimated treatment completion date.
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
 * Detect if a tray change was missed.
 */
export function isTrayChangeOverdue(
  lastChangeDate: Date,
  changeFrequencyDays: number,
  today: Date
): boolean {
  const nextChange = calculateNextChangeDate(lastChangeDate, changeFrequencyDays);
  const overdueThreshold = new Date(nextChange.getTime() + 24 * 60 * 60 * 1000);
  return today > overdueThreshold;
}