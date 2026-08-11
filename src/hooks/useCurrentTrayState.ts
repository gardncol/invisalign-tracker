import { useState, useEffect } from 'react';
import { useEventStore } from '../stores/useEventStore';
import { getCurrentState, getElapsedInCurrentState } from '../services/timeCalculator';
import type { CurrentTrayState } from '../types';

export function useCurrentTrayState() {
  const { latestEvent, loadTodaysEvents } = useEventStore();
  const [state, setState] = useState<CurrentTrayState>('unknown');
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    if (latestEvent) {
      setState(getCurrentState([latestEvent]));
    }
  }, [latestEvent]);

  useEffect(() => {
    loadTodaysEvents();
  }, [loadTodaysEvents]);

  useEffect(() => {
    if (state === 'unknown') return;

    const interval = setInterval(() => {
      const events = useEventStore.getState().todaysEvents;
      const elapsed = getElapsedInCurrentState(events, new Date());
      setElapsedMinutes(Math.round(elapsed * 60));
    }, 60_000); // Update every minute

    return () => clearInterval(interval);
  }, [state]);

  return { state, elapsedMinutes };
}