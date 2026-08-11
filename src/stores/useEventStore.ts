import { create } from 'zustand';
import { createEvent, getLatestEvent, getEventsForDate, getEventsInRange } from '../db/repositories/eventRepo';
import type { TrayEvent, EventType } from '../types';

interface EventState {
  todaysEvents: TrayEvent[];
  latestEvent: TrayEvent | null;
  loading: boolean;

  loadTodaysEvents: () => Promise<void>;
  addEvent: (type: EventType, timestamp?: Date, trayNumber?: number) => Promise<void>;
  refreshLatest: () => Promise<void>;
  getEventsForDay: (date: Date) => Promise<TrayEvent[]>;
  getEventsForRange: (start: Date, end: Date) => Promise<TrayEvent[]>;
}

export const useEventStore = create<EventState>((set) => ({
  todaysEvents: [],
  latestEvent: null,
  loading: true,

  loadTodaysEvents: async () => {
    const today = new Date();
    const events = await getEventsForDate(today);
    const latest = await getLatestEvent();
    set({ todaysEvents: events, latestEvent: latest, loading: false });
  },

  addEvent: async (type, timestamp = new Date(), trayNumber) => {
    await createEvent({ type, timestamp, trayNumber });
    await useEventStore.getState().loadTodaysEvents();
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
}));