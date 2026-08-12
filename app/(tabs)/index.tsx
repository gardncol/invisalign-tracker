import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { useCurrentTrayState } from '../../src/hooks/useCurrentTrayState';
import { useTodayProgress } from '../../src/hooks/useTodayProgress';
import { useUserStore } from '../../src/stores/useUserStore';
import { useEventStore } from '../../src/stores/useEventStore';
import { useStreak } from '../../src/hooks/useStreak';
import { ProgressRing } from '../../src/components/ProgressRing';
import { WearToggle } from '../../src/components/WearToggle';
import { TrayProgress } from '../../src/components/TrayProgress';
import { AlarmPopover } from '../../src/components/AlarmPopover';
import { TimerCard } from '../../src/components/TimerCard';
import { calculateEstimatedCompletionDate, getTrayProgressPct } from '../../src/services/trayScheduler';
import { schedulePutBackInAlarm, cancelPutBackInAlarm } from '../../src/services/notifications';
import { formatHours } from '../../src/utils/dates';
import { format } from 'date-fns';
import { useTheme } from '../../src/utils/theme';

export default function HomeScreen() {
  const addEvent = useEventStore((s) => s.addEvent);
  const loadTodaysEvents = useEventStore((s) => s.loadTodaysEvents);
  const alarmFireAt = useEventStore((s) => s.alarmFireAt);
  const setAlarmFireAt = useEventStore((s) => s.setAlarmFireAt);
  const user = useUserStore((s) => s.user);
  const { state, elapsedMinutes } = useCurrentTrayState();
  const { wornHours, goalHours, progressPct, wornFormatted, onPace, projectedCompletion, hoursRemaining } = useTodayProgress();
  const streak = useStreak();
  const { colors } = useTheme(user?.themePreference);
  const [showAlarmPopover, setShowAlarmPopover] = useState(false);
  const [alarmEditMode, setAlarmEditMode] = useState(false);

  useEffect(() => {
    loadTodaysEvents();
  }, [loadTodaysEvents]);

  const handleToggle = () => {
    if (state === 'in' || state === 'unknown') {
      // Marking out — show alarm popover
      setAlarmEditMode(false);
      setShowAlarmPopover(true);
    } else {
      // Marking in — cancel any pending alarm
      handleCancelAlarm();
      addEvent('in');
    }
  };

  const handleAlarmConfirm = async (delayMinutes: number) => {
    // If editing an existing alarm, cancel it first
    if (alarmEditMode) {
      await cancelPutBackInAlarm();
    }

    // Log the "out" event only if not already out (edit mode = already out)
    if (!alarmEditMode) {
      await addEvent('out');
    }

    // Schedule alarm if delay > 0
    if (delayMinutes > 0 && user?.alarmsEnabled) {
      const fireAt = new Date(Date.now() + delayMinutes * 60 * 1000);
      const minutesOut = delayMinutes;
      const severity = delayMinutes >= 90 ? 'firm' : 'gentle';
      await schedulePutBackInAlarm(fireAt, severity, minutesOut);
      setAlarmFireAt(fireAt);
    } else {
      // No alarm — clear it
      await cancelPutBackInAlarm();
      setAlarmFireAt(null);
    }
  };

  const handleCancelAlarm = async () => {
    await cancelPutBackInAlarm();
    setAlarmFireAt(null);
  };

  const handleTimerCardPress = () => {
    setAlarmEditMode(true);
    setShowAlarmPopover(true);
  };

  if (!user) return null;

  const completionDate = calculateEstimatedCompletionDate(user, new Date());
  const trayPct = getTrayProgressPct(user);
  const goalMet = wornHours >= goalHours;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.dateText, { color: colors.textSecondary }]}>{format(new Date(), 'EEEE, MMMM d')}</Text>

      {/* Streak badge */}
      {streak > 0 && (
        <View style={[styles.streakBadge, { backgroundColor: colors.warning + '20' }]}>
          <Text style={[styles.streakText, { color: colors.warning }]}>🔥 {streak} day{streak > 1 ? 's' : ''}</Text>
        </View>
      )}

      <ProgressRing
        wornHours={wornHours}
        goalHours={goalHours}
        progressPct={progressPct}
        wornFormatted={wornFormatted}
        colors={colors}
      />

      <WearToggle
        state={state}
        elapsedMinutes={elapsedMinutes}
        onPress={handleToggle}
      />

      {/* Alarm timer card — shown when an alarm is pending */}
      {alarmFireAt && state === 'out' && (
        <TimerCard
          alarmFireAt={alarmFireAt}
          onPress={handleTimerCardPress}
          colors={colors}
        />
      )}

      {/* On-pace indicator */}
      {!goalMet && hoursRemaining > 0 && (
        <Text style={[styles.paceText, { color: onPace ? colors.success : colors.warning }]}>
          {onPace && projectedCompletion
            ? `On pace — goal at ${format(projectedCompletion, 'h:mm a')}`
            : `${formatHours(hoursRemaining)} more needed to hit your goal`}
        </Text>
      )}
      {goalMet && (
        <Text style={[styles.paceText, { color: colors.success }]}>
          🎉 Goal met! Great job.
        </Text>
      )}

      {/* Tray progress bar */}
      <View style={styles.traySection}>
        <TrayProgress
          current={user.currentTray}
          total={user.totalTrays}
          pct={trayPct}
          colors={colors}
        />
        <Text style={[styles.completionText, { color: colors.textSecondary }]}>
          Estimated finish: {format(completionDate, 'MMM d, yyyy')}
        </Text>
      </View>

      {/* Alarm popover — shown when marking out or editing existing alarm */}
      <AlarmPopover
        visible={showAlarmPopover}
        onClose={() => setShowAlarmPopover(false)}
        onConfirm={handleAlarmConfirm}
        onCancelAlarm={handleCancelAlarm}
        thresholdMinutes={user.alarmThresholdMinutes}
        colors={colors}
        editMode={alarmEditMode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'space-evenly' },
  dateText: { fontSize: 18, fontWeight: '500' },
  streakBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16, marginTop: 4 },
  streakText: { fontSize: 16, fontWeight: '700' },
  paceText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  traySection: { alignItems: 'center' },
  completionText: { fontSize: 14, marginTop: 8 },
});