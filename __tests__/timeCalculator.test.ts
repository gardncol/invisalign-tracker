import { calculateWearTime, calculateDaySummary, calculateStreak, isOnPace, getProjectedCompletionTime } from '../src/services/timeCalculator';
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
  notificationsEnabled: true,
  alarmThresholdMinutes: 45,
  escalationEnabled: true,
  isOnboarded: true,
};

function makeEvent(type: 'in' | 'out', hour: number, minute: number = 0, dayOffset: number = 0): TrayEvent {
  const d = new Date(`2026-08-1${dayOffset}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`);
  return {
    id: Math.random(),
    type,
    timestamp: d,
    trayNumber: null,
    createdAt: d,
    modifiedAt: d,
    isEdited: false,
  };
}

describe('Time Calculator', () => {
  it('calculateWearTime returns total hours between in/out pairs', () => {
    const events: TrayEvent[] = [
      makeEvent('in', 8, 0),
      makeEvent('out', 12, 0),
      makeEvent('in', 13, 0),
      makeEvent('out', 20, 0),
    ];
    // 8-12 = 4h, 13-20 = 7h, total 11h, plus 20:00 to midnight = 4h (assumed in)
    const hours = calculateWearTime(events);
    expect(hours).toBeGreaterThan(10);
  });

  it('calculateWearTime handles overnight (assumes in if no out event)', () => {
    const events: TrayEvent[] = [
      makeEvent('in', 22, 0, 1),
      // No "out" event — assumed in through the night
    ];
    const hours = calculateWearTime(events, new Date('2026-08-11T23:59:59'));
    expect(hours).toBeCloseTo(2, 1); // 22:00 to 23:59 ≈ 2h
  });

  it('calculateDaySummary returns metGoal when hours >= goal', () => {
    const events: TrayEvent[] = [
      makeEvent('in', 0, 0),
      makeEvent('out', 12, 0),
      makeEvent('in', 13, 0),
    ];
    // 0-12 = 12h, 13-24 = 11h, total 23h — meets 22h goal
    const summary = calculateDaySummary(events, mockUser, new Date('2026-08-11'));
    expect(summary.metGoal).toBe(true);
  });

  it('calculateDaySummary returns metGoal=false when hours < goal', () => {
    const events: TrayEvent[] = [
      makeEvent('in', 8, 0),
      makeEvent('out', 12, 0),
      makeEvent('in', 13, 0),
      makeEvent('out', 20, 0),
    ];
    // 8-12 = 4h, 13-20 = 7h, 20-24 = 4h, total 15h
    const summary = calculateDaySummary(events, mockUser, new Date('2026-08-11'));
    expect(summary.metGoal).toBe(false);
  });

  it('isOnPace returns true when projected hours meet goal', () => {
    const elapsedHours = 10;
    const remainingAwakeHours = 8;
    const overnightHours = 8;
    const result = isOnPace(elapsedHours, remainingAwakeHours + overnightHours, 22);
    expect(result).toBe(true); // 10 + 16 = 26 > 22
  });

  it('calculateStreak counts consecutive days meeting goal', () => {
    const daySummaries = [
      { date: new Date('2026-08-09'), metGoal: true },
      { date: new Date('2026-08-10'), metGoal: true },
      { date: new Date('2026-08-11'), metGoal: true },
    ];
    expect(calculateStreak(daySummaries)).toBe(3);
  });

  it('calculateStreak resets on missed day', () => {
    const daySummaries = [
      { date: new Date('2026-08-08'), metGoal: true },
      { date: new Date('2026-08-09'), metGoal: false },
      { date: new Date('2026-08-10'), metGoal: true },
      { date: new Date('2026-08-11'), metGoal: true },
    ];
    expect(calculateStreak(daySummaries)).toBe(2);
  });
});