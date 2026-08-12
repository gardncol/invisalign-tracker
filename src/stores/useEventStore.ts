import { create } from 'zustand';
import { createEvent, getLatestEvent, getEventsForDate, getEventsInRange, updateEventTimestamp, deleteEvent } from '../db/repositories/eventRepo';
import type { TrayEvent, EventType } from '../types';

interface EventState {
  todaysEvents: TrayEvent[];
  latestEvent: TrayEvent | null;
  loading: boolean;
  alarmFireAt: Date | null;  // When the put-back-in alarm is scheduled to fire

  loadTodaysEvents: () => Promise<void>;
  addEvent: (type: EventType, timestamp?: Date, trayNumber?: number) => Promise<void>;
  refreshLatest: () => Promise<void>;
  getEventsForDay: (date: Date) => Promise<TrayEvent[]>;
  getEventsForRange: (start: Date, end: Date) => Promise<TrayEvent[]>;
  editEventTimestamp: (eventId: number, newTimestamp: Date) => Promise<void>;
  removeEvent: (eventId: number) => Promise<void>;
  setAlarmFireAt: (date: Date | null) => void;
}

async function refreshEvents(set: (partial: Partial<EventState>) => void) {
  const today = new Date();
  const events = await getEventsForDate(today);
  const latest = await getLatestEvent();
  set({ todaysEvents: events, latestEvent: latest, loading: false });
}

export const useEventStore = create<EventState>((set) => ({
  todaysEvents: [],
  latestEvent: null,
  loading: true,
  alarmFireAt: null,

  loadTodaysEvents: async () => {
    await refreshEvents(set);
  },

  addEvent: async (type, timestamp = new Date(), trayNumber) => {
    await createEvent({ type, timestamp, trayNumber });
    // If marking "in", clear any pending alarm
    if (type === 'in') {
      set({ alarmFireAt: null });
    }
    // Defer the store refresh to avoid triggering a re-render during the current render cycle
    queueMicrotask(() => {
      refreshEvents(set);
    });
  },

  refreshLatest: async () => {
    const latest = await getLatestEvent();
    set({ latestEvent: latest });
  },

  getEventsForDay: async (date) => {
    return await getEventsForDate(date);
  },

  getEventsForRange: async (start, end) => {
    return await getEventsInRange(start, end);
  },

  editEventTimestamp: async (eventId, newTimestamp) => {
    await updateEventTimestamp(eventId, newTimestamp);
    queueMicrotask(() => {
      refreshEvents(set);
    });
  },

  removeEvent: async (eventId) => {
    await deleteEvent(eventId);
    queueMicrotask(() => {
      refreshEvents(set);
    });
  },

  setAlarmFireAt: (date) => {
    set({ alarmFireAt: date });
  },
}));