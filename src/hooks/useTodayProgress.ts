import { useState, useEffect } from 'react';
import { useEventStore } from '../stores/useEventStore';
import { useUserStore } from '../stores/useUserStore';
import { calculateWearTime, isOnPace, getProjectedCompletionTime } from '../services/timeCalculator';
import { formatHours, isWithinAwakeHours } from '../utils/dates';

export function useTodayProgress() {
  const todaysEvents = useEventStore((s) => s.todaysEvents);
  const loadTodaysEvents = useEventStore((s) => s.loadTodaysEvents);
  const user = useUserStore((s) => s.user);
  const [wornHours, setWornHours] = useState(0);
  const [onPace, setOnPace] = useState(false);
  const [projectedCompletion, setProjectedCompletion] = useState<Date | null>(null);

  useEffect(() => {
    loadTodaysEvents();
  }, [loadTodaysEvents]);

  useEffect(() => {
    if (!user) return;

    const hours = calculateWearTime(todaysEvents);
    setWornHours(hours);

    const now = new Date();
    const awake = isWithinAwakeHours(now, user.awakeStart, user.awakeEnd);
    // Estimate remaining hours: awake hours left + overnight hours
    const remainingPossible = awake ? 8 : 8;
    setOnPace(isOnPace(hours, remainingPossible, user.dailyGoalHours));

    const projected = getProjectedCompletionTime(hours, user.dailyGoalHours, now);
    setProjectedCompletion(projected);
  }, [todaysEvents, user]);

  const hoursRemaining = user ? Math.max(0, user.dailyGoalHours - wornHours) : 0;

  return {
    wornHours,
    goalHours: user?.dailyGoalHours ?? 22,
    progressPct: user ? Math.min(100, (wornHours / user.dailyGoalHours) * 100) : 0,
    onPace,
    projectedCompletion,
    wornFormatted: formatHours(wornHours),
    hoursRemaining,
  };
}