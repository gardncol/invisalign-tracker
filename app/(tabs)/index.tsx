import { View, Text, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { useCurrentTrayState } from '../../src/hooks/useCurrentTrayState';
import { useTodayProgress } from '../../src/hooks/useTodayProgress';
import { useUserStore } from '../../src/stores/useUserStore';
import { useEventStore } from '../../src/stores/useEventStore';
import { ProgressRing } from '../../src/components/ProgressRing';
import { WearToggle } from '../../src/components/WearToggle';
import { TrayProgress } from '../../src/components/TrayProgress';
import { calculateEstimatedCompletionDate, getTraysRemaining, getTrayProgressPct } from '../../src/services/trayScheduler';
import { format } from 'date-fns';

export default function HomeScreen() {
  const { state, elapsedMinutes } = useCurrentTrayState();
  const { wornHours, goalHours, progressPct, wornFormatted, onPace, projectedCompletion } = useTodayProgress();
  const { user } = useUserStore();
  const { addEvent, loadTodaysEvents } = useEventStore();

  useEffect(() => {
    loadTodaysEvents();
  }, [loadTodaysEvents]);

  const handleToggle = () => {
    const newType = state === 'in' ? 'out' : 'in';
    addEvent(newType);
  };

  if (!user) return null;

  const completionDate = calculateEstimatedCompletionDate(user, new Date());
  const traysRemaining = getTraysRemaining(user);
  const trayPct = getTrayProgressPct(user);

  return (
    <View style={styles.container}>
      <Text style={styles.dateText}>{format(new Date(), 'EEEE, MMMM d')}</Text>

      <ProgressRing
        wornHours={wornHours}
        goalHours={goalHours}
        progressPct={progressPct}
        wornFormatted={wornFormatted}
      />

      <WearToggle
        state={state}
        elapsedMinutes={elapsedMinutes}
        onPress={handleToggle}
      />

      {onPace && projectedCompletion && (
        <Text style={styles.paceText}>
          On pace — goal at {format(projectedCompletion, 'h:mm a')}
        </Text>
      )}

      <View style={styles.trayInfo}>
        <Text style={styles.trayTitle}>Tray {user.currentTray} of {user.totalTrays}</Text>
        <Text style={styles.traySubtitle}>{trayPct}% complete</Text>
        <Text style={styles.traySubtitle}>
          Estimated finish: {format(completionDate, 'MMM d, yyyy')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'space-evenly' },
  dateText: { fontSize: 18, color: '#666', fontWeight: '500' },
  paceText: { fontSize: 16, color: '#34C759', fontWeight: '600' },
  trayInfo: { alignItems: 'center' },
  trayTitle: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  traySubtitle: { fontSize: 16, color: '#666', marginTop: 4 },
});