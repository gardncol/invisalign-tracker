import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NOTIFICATION_IDS } from '../utils/constants';

/**
 * Request notification permissions.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Schedule a tray change reminder.
 * Uses the actual last-change date to implement day drift.
 */
export async function scheduleTrayChangeReminder(
  nextChangeDate: Date,
  trayNumber: number,
  trayChangeTime: string
): Promise<string> {
  // Cancel existing tray change notification
  await cancelNotification(NOTIFICATION_IDS.TRAY_CHANGE);

  const [hours, minutes] = trayChangeTime.split(':').map(Number);
  const trigger = new Date(nextChangeDate);
  trigger.setHours(hours, minutes, 0, 0);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time to change your tray! 🦷',
      body: `Switch to tray ${trayNumber}. Tap to confirm.`,
      data: { type: 'tray_change', trayNumber },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: trigger,
    },
  });

  return id;
}

/**
 * Schedule an alarm notification for trays out too long.
 */
export async function schedulePutBackInAlarm(
  fireAt: Date,
  severity: 'gentle' | 'firm' | 'urgent',
  minutesOut: number
): Promise<string> {
  const titles = {
    gentle: 'Your trays have been out for a while',
    firm: 'You\'re at risk of missing today\'s goal',
    urgent: '⚠️ Put your trays in now to hit your goal!',
  };

  const bodies = {
    gentle: `${minutesOut} minutes — time to put them back in.`,
    firm: `${minutesOut} minutes out. Your daily goal is at risk.`,
    urgent: `You can still hit your goal if you put trays in now.`,
  };

  return await Notifications.scheduleNotificationAsync({
    content: {
      title: titles[severity],
      body: bodies[severity],
      data: { type: 'alarm', severity, minutesOut },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fireAt,
    },
  });
}

/**
 * Cancel a scheduled notification by ID.
 */
export async function cancelNotification(identifier: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

/**
 * Cancel all scheduled notifications.
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get all scheduled notifications (for debugging).
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Configure notification handler for foreground notifications.
 */
export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    }),
  });
}

/**
 * Set up notification response listener (user tapped notification).
 */
export function setupNotificationResponseListener(
  onTrayChange: (trayNumber: number) => void,
  onAlarm: () => void
): { remove: () => void } {
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data as Record<string, unknown> | undefined;
    if (data?.type === 'tray_change') {
      onTrayChange(data.trayNumber as number);
    } else if (data?.type === 'alarm') {
      onAlarm();
    }
  });
  return subscription;
}

/**
 * Schedule an overnight prompt asking if trays were out overnight.
 */
export async function scheduleOvernightPrompt(lastInEventTime: Date): Promise<string | null> {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(8, 0, 0, 0); // 8 AM prompt

  return await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Did you take your trays out last night?',
      body: `Your last "in" event was at ${lastInEventTime.toLocaleTimeString()}. Tap to correct if needed.`,
      data: { type: 'overnight_prompt' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: tomorrow,
    },
  });
}