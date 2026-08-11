import type { TrayEvent, UserProfile, DaySummary, WeekSummary } from '../types';
import { calculateWearTime } from './timeCalculator';
import { subDays, startOfWeek, format } from 'date-fns';

interface DayOfWeekAverage {
  dayOfWeek: string;
  avgHours: number;
  dayCount: number;
}

/**
 * Get daily summaries for the last N days.
 */
export function getDailySummaries(
  events: TrayEvent[],
  user: UserProfile,
  numDays: number,
  endDate: Date
): DaySummary[] {
  const summaries: DaySummary[] = [];

  for (let i = numDays - 1; i >= 0; i--) {
    const date = subDays(endDate, i);
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dayEvents = events.filter((e) => {
      const t = new Date(e.timestamp);
      return t >= dayStart && t <= dayEnd;
    });

    const wornHours = calculateWearTime(dayEvents, dayEnd);

    summaries.push({
      date,
      totalWornHours: wornHours,
      goalHours: user.dailyGoalHours,
      metGoal: wornHours >= user.dailyGoalHours,
      events: dayEvents.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
    });
  }

  return summaries;
}

/**
 * Get weekly summaries for the last N weeks.
 */
export function getWeeklySummaries(
  events: TrayEvent[],
  user: UserProfile,
  numWeeks: number,
  endDate: Date
): WeekSummary[] {
  const summaries: WeekSummary[] = [];

  for (let i = 0; i < numWeeks; i++) {
    const weekEnd = subDays(endDate, i * 7);
    const weekStart = startOfWeek(weekEnd, { weekStartsOn: 1 }); // Monday

    const dailyForWeek = getDailySummaries(events, user, 7, weekEnd);
    const daysMetGoal = dailyForWeek.filter((d) => d.metGoal).length;
    const avgHours =
      dailyForWeek.reduce((sum, d) => sum + d.totalWornHours, 0) / dailyForWeek.length;
    const compliancePct = (daysMetGoal / dailyForWeek.length) * 100;

    summaries.push({
      weekStart,
      weekEnd,
      avgHoursPerDay: avgHours,
      goalHours: user.dailyGoalHours,
      compliancePct,
      daysMetGoal,
      totalDays: dailyForWeek.length,
    });
  }

  return summaries.reverse();
}

/**
 * Get average wear hours by day of week (identifies patterns).
 */
export function getDayOfWeekAverages(
  events: TrayEvent[],
  user: UserProfile,
  numDays: number,
  endDate: Date
): DayOfWeekAverage[] {
  const dailySummaries = getDailySummaries(events, user, numDays, endDate);

  const dayMap: Record<string, number[]> = {};
  for (const summary of dailySummaries) {
    const dayName = format(summary.date, 'EEEE');
    if (!dayMap[dayName]) dayMap[dayName] = [];
    dayMap[dayName].push(summary.totalWornHours);
  }

  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return dayOrder.map((dayName) => {
    const hours = dayMap[dayName] ?? [];
    return {
      dayOfWeek: dayName,
      avgHours: hours.length > 0 ? hours.reduce((a, b) => a + b, 0) / hours.length : 0,
      dayCount: hours.length,
    };
  });
}

/**
 * Get overall compliance percentage across all tracked days.
 */
export function getOverallCompliance(
  events: TrayEvent[],
  user: UserProfile,
  startDate: Date,
  endDate: Date
): number {
  const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const dailySummaries = getDailySummaries(events, user, totalDays, endDate);
  const daysMetGoal = dailySummaries.filter((d) => d.metGoal).length;
  return (daysMetGoal / totalDays) * 100;
}