import { getDailySummaries, getWeeklySummaries, getDayOfWeekAverages } from '../src/services/reporting';
import type { TrayEvent, UserProfile } from '../src/types';

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

describe('Reporting Service', () => {
  it('getDailySummaries returns 7 days of summaries', () => {
    const events: TrayEvent[] = [];
    const result = getDailySummaries(events, mockUser, 7, new Date('2026-08-11'));
    expect(result.length).toBe(7);
  });

  it('getWeeklySummaries aggregates days into weekly averages', () => {
    const result = getWeeklySummaries([], mockUser, 4, new Date('2026-08-11'));
    expect(result.length).toBe(4);
  });

  it('getDayOfWeekAverages identifies best and worst days', () => {
    const result = getDayOfWeekAverages([], mockUser, 30, new Date('2026-08-11'));
    expect(result.length).toBe(7); // 7 days of week
    expect(result[0]).toHaveProperty('dayOfWeek');
    expect(result[0]).toHaveProperty('avgHours');
  });
});