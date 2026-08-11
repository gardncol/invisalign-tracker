import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUserStore } from '../src/stores/useUserStore';
import { useEventStore } from '../src/stores/useEventStore';
import { advanceToTray } from '../src/db/repositories/trayRepo';
import { scheduleTrayChangeReminder } from '../src/services/notifications';
import { calculateNextChangeDateWithDay } from '../src/services/trayScheduler';
import { useTheme } from '../src/utils/theme';

export default function TrayChangeScreen() {
  const router = useRouter();
  const { tray } = useLocalSearchParams<{ tray: string }>();
  const user = useUserStore((s) => s.user);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const addEvent = useEventStore((s) => s.addEvent);
  const { colors } = useTheme(user?.themePreference);

  const newTray = parseInt(tray || '0') || (user ? user.currentTray + 1 : 1);

  const handleConfirm = async () => {
    if (!user) return;

    await addEvent('tray_change', new Date(), newTray);
    await advanceToTray(newTray);
    await updateProfile({ currentTray: newTray });

    const nextChange = calculateNextChangeDateWithDay(new Date(), user.changeFrequencyDays, user.trayChangeDay, user.trayChangeTime);
    await scheduleTrayChangeReminder(nextChange, newTray + 1, user.trayChangeTime);

    router.back();
  };

  const handleSnooze = async () => {
    if (!user) return;
    // Reschedule the notification for 1 hour from now
    const snoozeTime = new Date(Date.now() + 60 * 60 * 1000);
    await scheduleTrayChangeReminder(snoozeTime, newTray, user.trayChangeTime);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={styles.emoji}>🦷</Text>
      <Text style={[styles.title, { color: colors.text }]}>Time to switch!</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Change to tray {newTray} now.
      </Text>

      <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: colors.primary }]} onPress={handleConfirm}>
        <Text style={styles.confirmBtnText}>Confirm: Switched to tray {newTray}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.snoozeBtn, { borderColor: colors.inputBorder }]} onPress={handleSnooze}>
        <Text style={[styles.snoozeBtnText, { color: colors.textSecondary }]}>Snooze 1 hour</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 18, marginBottom: 40 },
  confirmBtn: { borderRadius: 16, padding: 18, width: '100%', alignItems: 'center', marginBottom: 12 },
  confirmBtnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  snoozeBtn: { borderWidth: 1, borderRadius: 16, padding: 18, width: '100%', alignItems: 'center' },
  snoozeBtnText: { fontSize: 18 },
});