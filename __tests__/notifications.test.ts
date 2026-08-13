/**
 * Tests for the alarm cancellation bug (issue #1).
 *
 * Root cause: schedulePutBackInAlarm / scheduleTrayChangeReminder did not pass
 * a fixed `identifier` to scheduleNotificationAsync, so expo-notifications
 * assigned a random UUID. cancelPutBackInAlarm cancels by the fixed
 * NOTIFICATION_IDS.ALARM_THRESHOLD string, which never matched — making the
 * cancel a no-op and the alarm kept firing after the user marked trays in.
 */
import * as Notifications from 'expo-notifications';

// Mock expo-notifications
const mockSchedule = jest.fn().mockResolvedValue('mock-id');
const mockCancel = jest.fn().mockResolvedValue(undefined);
const mockSetChannel = jest.fn().mockResolvedValue(null);
jest.mock('expo-notifications', () => ({
  SchedulableTriggerInputTypes: { DATE: 'date' },
  AndroidNotificationPriority: { HIGH: 'high' },
  AndroidImportance: { HIGH: 6 },
  AndroidNotificationVisibility: { PUBLIC: 1 },
  scheduleNotificationAsync: (...args: unknown[]) => mockSchedule(...args),
  cancelScheduledNotificationAsync: (...args: unknown[]) => mockCancel(...args),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: (...args: unknown[]) => mockSetChannel(...args),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
}));

import { schedulePutBackInAlarm, cancelPutBackInAlarm, scheduleTrayChangeReminder } from '../src/services/notifications';
import { NOTIFICATION_IDS } from '../src/utils/constants';

describe('Alarm cancellation (issue #1)', () => {
  beforeEach(() => {
    mockSchedule.mockClear();
    mockCancel.mockClear();
  });

  it('schedulePutBackInAlarm uses the fixed ALARM_THRESHOLD identifier', async () => {
    const fireAt = new Date(Date.now() + 15 * 60 * 1000);
    await schedulePutBackInAlarm(fireAt, 'gentle', 15);

    expect(mockSchedule).toHaveBeenCalledTimes(1);
    const args = mockSchedule.mock.calls[0][0];
    expect(args.identifier).toBe(NOTIFICATION_IDS.ALARM_THRESHOLD);
  });

  it('cancelPutBackInAlarm cancels by the same fixed identifier', async () => {
    await cancelPutBackInAlarm();

    expect(mockCancel).toHaveBeenCalledTimes(1);
    expect(mockCancel).toHaveBeenCalledWith(NOTIFICATION_IDS.ALARM_THRESHOLD);
  });

  it('scheduleTrayChangeReminder uses the fixed TRAY_CHANGE identifier', async () => {
    const nextChange = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await scheduleTrayChangeReminder(nextChange, 5, '22:00');

    expect(mockSchedule).toHaveBeenCalledTimes(1);
    const args = mockSchedule.mock.calls[0][0];
    expect(args.identifier).toBe(NOTIFICATION_IDS.TRAY_CHANGE);
  });
});

describe('Foreground notifications (issue #7)', () => {
  beforeEach(() => {
    mockSchedule.mockClear();
    mockSetChannel.mockClear();
  });

  it('schedulePutBackInAlarm uses the tray-reminders channel', async () => {
    const fireAt = new Date(Date.now() + 15 * 60 * 1000);
    await schedulePutBackInAlarm(fireAt, 'gentle', 15);

    expect(mockSchedule).toHaveBeenCalledTimes(1);
    const args = mockSchedule.mock.calls[0][0];
    expect(args.trigger.channelId).toBe('tray-reminders');
  });

  it('scheduleTrayChangeReminder uses the tray-reminders channel', async () => {
    const nextChange = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await scheduleTrayChangeReminder(nextChange, 5, '22:00');

    expect(mockSchedule).toHaveBeenCalledTimes(1);
    const args = mockSchedule.mock.calls[0][0];
    expect(args.trigger.channelId).toBe('tray-reminders');
  });
});