import {
  getStartOfDay,
  getEndOfDay,
  formatHours,
  isWithinAwakeHours,
  getDaysBetween,
  formatTimeOfDay,
  toUTC,
  fromUTC,
} from '../src/utils/dates';

describe('Date utilities', () => {
  it('getStartOfDay returns midnight for a date', () => {
    const date = new Date('2026-08-11T14:30:00');
    const start = getStartOfDay(date);
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
  });

  it('getEndOfDay returns 23:59:59', () => {
    const date = new Date('2026-08-11T14:30:00');
    const end = getEndOfDay(date);
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
    expect(end.getSeconds()).toBe(59);
  });

  it('formatHours converts decimal hours to "Xh Ym"', () => {
    expect(formatHours(21.5)).toBe('21h 30m');
    expect(formatHours(22)).toBe('22h 0m');
    expect(formatHours(0)).toBe('0h 0m');
  });

  it('isWithinAwakeHours returns true during awake window', () => {
    const date = new Date('2026-08-11T14:30:00');
    expect(isWithinAwakeHours(date, '07:00', '22:00')).toBe(true);
  });

  it('isWithinAwakeHours returns false outside awake window', () => {
    const date = new Date('2026-08-11T02:30:00');
    expect(isWithinAwakeHours(date, '07:00', '22:00')).toBe(false);
  });

  it('getDaysBetween returns difference in days', () => {
    const start = new Date('2026-08-01');
    const end = new Date('2026-08-11');
    expect(getDaysBetween(start, end)).toBe(10);
  });

  it('formatTimeOfDay returns "HH:mm" string', () => {
    const date = new Date('2026-08-11T14:30:00');
    expect(formatTimeOfDay(date)).toBe('14:30');
  });

  it('toUTC/fromUTC round-trip preserves timestamp', () => {
    const original = new Date('2026-08-11T14:30:00');
    const utc = toUTC(original);
    const back = fromUTC(utc);
    expect(back.getTime()).toBe(original.getTime());
  });
});