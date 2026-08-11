import type { TrayEvent, UserProfile, DaySummary, CurrentTrayState } from '../types';
import { getEndOfDay } from '../utils/dates';

/**
 * Calculate total wear time (in hours) from a list of events for a single day.
 * Assumes trays are "in" if the last event is "in" and no "out" follows.
 * If the last event is "in", counts from that timestamp to end of day.
 * If the last event is "out", counts nothing after that.
 * If no events, returns 0.
 */
export function calculateWearTime(events: TrayEvent[], dayEnd?: Date): number {
  if (events.length === 0) return 0;

  const sorted = [...events].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  let totalMs = 0;
  let inTime: Date | null = null;

  for (const event of sorted) {
    if (event.type === 'in') {
      inTime = event.timestamp;
    } else if (event.type === 'out' && inTime) {
      totalMs += event.timestamp.getTime() - inTime.getTime();
      inTime = null;
    }
  }

  // If still "in" at end of events, count to end of day
  if (inTime) {
    const endTime = dayEnd ?? getEndOfDay(sorted[0].timestamp);
    totalMs += endTime.getTime() - inTime.getTime();
  }

  return Math.max(0, totalMs / (1000 * 60 * 60));
}

/**
 * Build a day summary from events.
 */
export function calculateDaySummary(
  events: TrayEvent[],
  user: UserProfile,
  date: Date
): DaySummary {
  const dayEvents = events.filter((e) => {
    const eventDate = new Date(e.timestamp);
    return (
      eventDate.getDate() === date.getDate() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getFullYear() === date.getFullYear()
    );
  });

  const totalWornHours = calculateWearTime(dayEvents);
  const goalHours = user.dailyGoalHours;

  return {
    date,
    totalWornHours,
    goalHours,
    metGoal: totalWornHours >= goalHours,
    events: dayEvents.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
  };
}

/**
 * Determine if user is on pace to meet today's goal.
 */
export function isOnPace(
  elapsedWornHours: number,
  remainingPossibleHours: number,
  goalHours: number
): boolean {
  return elapsedWornHours + remainingPossibleHours >= goalHours;
}

/**
 * Project the time the user will hit their goal today, assuming they put trays in now.
 */
export function getProjectedCompletionTime(
  currentWornHours: number,
  goalHours: number,
  now: Date
): Date | null {
  const remaining = goalHours - currentWornHours;
  if (remaining <= 0) return now; // Already met

  const projected = new Date(now.getTime() + remaining * 60 * 60 * 1000);
  return projected;
}

/**
 * Calculate the current tray state from the latest event.
 */
export function getCurrentState(events: TrayEvent[]): CurrentTrayState {
  if (events.length === 0) return 'unknown';
  const sorted = [...events].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  return sorted[0].type === 'in' ? 'in' : sorted[0].type === 'out' ? 'out' : 'unknown';
}

/**
 * Calculate elapsed time in current state (in hours).
 */
export function getElapsedInCurrentState(events: TrayEvent[], now: Date): number {
  const state = getCurrentState(events);
  if (state === 'unknown') return 0;

  const sorted = [...events].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const latest = sorted[0];
  return (now.getTime() - latest.timestamp.getTime()) / (1000 * 60 * 60);
}

/**
 * Calculate streak: consecutive days (ending today) where goal was met.
 */
export function calculateStreak(
  daySummaries: { date: Date; metGoal: boolean }[]
): number {
  const sorted = [...daySummaries].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  let streak = 0;
  for (const day of sorted) {
    if (day.metGoal) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}