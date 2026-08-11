import { calculateNextChangeDate, calculateEstimatedCompletionDate, getTraysRemaining } from '../src/services/trayScheduler';
import type { UserProfile } from '../src/types';

const mockUser: UserProfile = {
  id: 1,
  totalTrays: 24,
  changeFrequencyDays: 7,
  currentTray: 5,
  dailyGoalHours: 22,
  awakeStart: '07:00',
  awakeEnd: '22:00',
  trayChangeTime: '22:00',
  trayChangeDay: -1,
  notificationsEnabled: true,
  alarmsEnabled: true,
  alarmThresholdMinutes: 45,
  escalationEnabled: true,
  themePreference: 'system',
  isOnboarded: true,
};

describe('Tray Scheduler', () => {
  it('calculateNextChangeDate adds changeFrequencyDays to last change', () => {
    const lastChange = new Date('2026-08-04T12:00:00');
    const result = calculateNextChangeDate(lastChange, 7);
    const expected = new Date('2026-08-11T12:00:00');
    expect(result.toISOString()).toBe(expected.toISOString());
  });

  it('calculateEstimatedCompletionDate computes from remaining trays', () => {
    const today = new Date('2026-08-11T12:00:00');
    const result = calculateEstimatedCompletionDate(mockUser, today);
    // 24 - 5 + 1 = 20 trays remaining × 7 days = 140 days from Aug 11
    const expected = new Date('2026-08-11T12:00:00');
    expected.setDate(expected.getDate() + 140);
    expect(result.toISOString()).toBe(expected.toISOString());
  });

  it('getTraysRemaining returns total minus current plus 1 (including current)', () => {
    expect(getTraysRemaining(mockUser)).toBe(20);
  });

  it('calculateNextChangeDate with day drift shifts next reminder', () => {
    const actualChange = new Date('2026-08-13T12:00:00'); // 2 days late
    const result = calculateNextChangeDate(actualChange, 7);
    const expected = new Date('2026-08-20T12:00:00'); // Aug 13 + 7 = Aug 20
    expect(result.toISOString()).toBe(expected.toISOString());
  });
});