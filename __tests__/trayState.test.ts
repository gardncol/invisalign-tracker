import { getCurrentState } from '../src/services/timeCalculator';
import type { TrayEvent } from '../src/types';

function makeEvent(type: 'in' | 'out', hour: number, minute: number = 0): TrayEvent {
  const d = new Date(`2026-08-12T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`);
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

describe('Default tray state', () => {
  it('getCurrentState returns "unknown" when no events exist (UI treats this as "in")', () => {
    // The hook useCurrentTrayState maps empty events to 'in' state.
    // getCurrentState itself still returns 'unknown' for backward compatibility,
    // but the UI defaults to "in" display.
    expect(getCurrentState([])).toBe('unknown');
  });

  it('getCurrentState returns "in" when last event is "in"', () => {
    const events: TrayEvent[] = [
      makeEvent('in', 8, 0),
      makeEvent('out', 12, 0),
      makeEvent('in', 13, 0),
    ];
    expect(getCurrentState(events)).toBe('in');
  });

  it('getCurrentState returns "out" when last event is "out"', () => {
    const events: TrayEvent[] = [
      makeEvent('in', 8, 0),
      makeEvent('out', 12, 0),
    ];
    expect(getCurrentState(events)).toBe('out');
  });
});