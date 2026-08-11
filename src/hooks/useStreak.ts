import { useState, useEffect } from 'react';
import { useEventStore } from '../stores/useEventStore';
import { useUserStore } from '../stores/useUserStore';
import { getDailySummaries } from '../services/reporting';
import { calculateStreak } from '../services/timeCalculator';

export function useStreak() {
  const getEventsForRange = useEventStore((s) => s.getEventsForRange);
  const user = useUserStore((s) => s.user);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!user) return;

    (async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // Last 30 days

      const events = await getEventsForRange(startDate, endDate);
      const daily = getDailySummaries(events, user, 30, endDate);
      const streakCount = calculateStreak(daily);
      setStreak(streakCount);
    })();
  }, [user, getEventsForRange]);

  return streak;
}