import { useState, useEffect } from 'react';
import { useEventStore } from '../stores/useEventStore';
import { getCurrentState, getElapsedInCurrentState } from '../services/timeCalculator';
import type { CurrentTrayState } from '../types';

export function useCurrentTrayState() {
  const todaysEvents = useEventStore((s) => s.todaysEvents);
  const loadTodaysEvents = useEventStore((s) => s.loadTodaysEvents);
  const [state, setState] = useState<CurrentTrayState>('unknown');
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  // Compute state from todaysEvents array — re-runs whenever the array reference changes
  useEffect(() => {
    if (todaysEvents.length > 0) {
      setState(getCurrentState(todaysEvents));
    } else {
      setState('unknown');
    }
  }, [todaysEvents]);

  // Load events on mount
  useEffect(() => {
    loadTodaysEvents();
  }, [loadTodaysEvents]);

  // Update elapsed time every minute when in a known state
  useEffect(() => {
    if (state === 'unknown') {
      setElapsedMinutes(0);
      return;
    }

    const updateElapsed = () => {
      const events = useEventStore.getState().todaysEvents;
      if (events.length > 0) {
        const elapsed = getElapsedInCurrentState(events, new Date());
        setElapsedMinutes(Math.round(elapsed * 60));
      }
    };

    updateElapsed(); // Run immediately
    const interval = setInterval(updateElapsed, 60_000);

    return () => clearInterval(interval);
  }, [state]);

  return { state, elapsedMinutes };
}