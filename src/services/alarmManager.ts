import type { UserProfile } from '../types';
import { getCurrentState, getElapsedInCurrentState } from './timeCalculator';
import { schedulePutBackInAlarm, cancelNotification } from './notifications';
import { NOTIFICATION_IDS } from '../utils/constants';
import { getEventsForDate } from '../db/repositories/eventRepo';
import { isWithinAwakeHours } from '../utils/dates';

/**
 * Check if trays are out and an alarm should fire.
 * Returns severity based on how long trays have been out and time of day.
 */
export async function checkAndScheduleAlarm(user: UserProfile): Promise<void> {
  if (!user.alarmsEnabled) return;

  const todayEvents = await getEventsForDate(new Date());
  const state = getCurrentState(todayEvents);

  if (state !== 'out') {
    // Trays are in — cancel any pending alarm
    await cancelNotification(NOTIFICATION_IDS.ALARM_THRESHOLD).catch(() => {});
    return;
  }

  const elapsedHours = getElapsedInCurrentState(todayEvents, new Date());
  const minutesOut = Math.round(elapsedHours * 60);

  // Only alarm if past the threshold
  if (minutesOut < user.alarmThresholdMinutes) return;

  const now = new Date();
  const awake = isWithinAwakeHours(now, user.awakeStart, user.awakeEnd);

  // If asleep, don't alarm — wait until awake window
  if (!awake) return;

  // Determine severity
  let severity: 'gentle' | 'firm' | 'urgent';
  if (minutesOut > 90) {
    severity = 'urgent';
  } else if (minutesOut > 60) {
    severity = 'firm';
  } else {
    severity = 'gentle';
  }

  // Schedule alarm 5 minutes from now
  const fireAt = new Date(Date.now() + 5 * 60 * 1000);
  await schedulePutBackInAlarm(fireAt, severity, minutesOut);
}