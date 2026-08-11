import { View, Text, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { useCurrentTrayState } from '../../src/hooks/useCurrentTrayState';
import { useTodayProgress } from '../../src/hooks/useTodayProgress';
import { useUserStore } from '../../src/stores/useUserStore';
import { useEventStore } from '../../src/stores/useEventStore';
import { ProgressRing } from '../../src/components/ProgressRing';
import { WearToggle } from '../../src/components/WearToggle';
import { calculateEstimatedCompletionDate, getTraysRemaining, getTrayProgressPct } from '../../src/services/trayScheduler';
import { format } from 'date-fns';
import { useTheme } from '../../src/utils/theme';

export default function HomeScreen() {
  const { state, elapsedMinutes } = useCurrentTrayState();
  const { wornHours, goalHours, progressPct, wornFormatted, onPace, projectedCompletion } = useTodayProgress();
  const { user } = useUserStore();
  const { addEvent, loadTodaysEvents } = useEventStore();
  const { colors } = useTheme(user?.themePreference);

  useEffect(() => {
    loadTodaysEvents();
  }, [loadTodaysEvents]);

  const handleToggle = () => {
    const newType = state === 'in' ? 'out' : 'in';
    addEvent(newType);
  };

  if (!user) return null;

  const completionDate = calculateEstimatedCompletionDate(user, new Date());
  const trayPct = getTrayProgressPct(user);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.dateText, { color: colors.textSecondary }]}>{format(new Date(), 'EEEE, MMMM d')}</Text>

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

      {onPace && projectedCompletion && (
        <Text style={[styles.paceText, { color: colors.success }]}>
          On pace — goal at {format(projectedCompletion, 'h:mm a')}
        </Text>
      )}

      <View style={styles.trayInfo}>
        <Text style={[styles.trayTitle, { color: colors.text }]}>Tray {user.currentTray} of {user.totalTrays}</Text>
        <Text style={[styles.traySubtitle, { color: colors.textSecondary }]}>{trayPct}% complete</Text>
        <Text style={[styles.traySubtitle, { color: colors.textSecondary }]}>
          Estimated finish: {format(completionDate, 'MMM d, yyyy')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'space-evenly' },
  dateText: { fontSize: 18, fontWeight: '500' },
  paceText: { fontSize: 16, fontWeight: '600' },
  trayInfo: { alignItems: 'center' },
  trayTitle: { fontSize: 22, fontWeight: '700' },
  traySubtitle: { fontSize: 16, marginTop: 4 },
});