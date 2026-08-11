import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUserStore } from '../src/stores/useUserStore';
import { useEventStore } from '../src/stores/useEventStore';
import { advanceToTray } from '../src/db/repositories/trayRepo';
import { scheduleTrayChangeReminder } from '../src/services/notifications';
import { calculateNextChangeDate } from '../src/services/trayScheduler';

export default function TrayChangeScreen() {
  const router = useRouter();
  const { tray } = useLocalSearchParams<{ tray: string }>();
  const { user, updateProfile } = useUserStore();
  const { addEvent } = useEventStore();

  const newTray = parseInt(tray || '0') || (user ? user.currentTray + 1 : 1);

  const handleConfirm = async () => {
    if (!user) return;

    // Log the tray change event
    await addEvent('tray_change', new Date(), newTray);

    // Close current tray record, create new one
    await advanceToTray(newTray);

    // Update user's current tray
    await updateProfile({ currentTray: newTray });

    // Schedule next reminder (with day drift: based on actual change date = today)
    const nextChange = calculateNextChangeDate(new Date(), user.changeFrequencyDays);
    await scheduleTrayChangeReminder(nextChange, newTray + 1, user.trayChangeTime);

    router.back();
  };

  const handleSnooze = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🦷</Text>
      <Text style={styles.title}>Time to switch!</Text>
      <Text style={styles.subtitle}>
        Change to tray {newTray} now.
      </Text>

      <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
        <Text style={styles.confirmBtnText}>Confirm: Switched to tray {newTray}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.snoozeBtn} onPress={handleSnooze}>
        <Text style={styles.snoozeBtnText}>Snooze 1 hour</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 24 },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#1a1a1a', marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#666', marginBottom: 40 },
  confirmBtn: { backgroundColor: '#007AFF', borderRadius: 16, padding: 18, width: '100%', alignItems: 'center', marginBottom: 12 },
  confirmBtnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  snoozeBtn: { borderWidth: 1, borderColor: '#ddd', borderRadius: 16, padding: 18, width: '100%', alignItems: 'center' },
  snoozeBtnText: { color: '#666', fontSize: 18 },
});