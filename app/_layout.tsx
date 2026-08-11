import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';
import { useUserStore } from '../src/stores/useUserStore';
import { initializeDatabase } from '../src/db/client';
import { configureNotificationHandler, scheduleTrayChangeReminder, schedulePutBackInAlarm, scheduleOvernightPrompt } from '../src/services/notifications';
import { calculateNextChangeDateWithDay } from '../src/services/trayScheduler';
import { getCurrentTrayRecord } from '../src/db/repositories/trayRepo';
import { getLatestEvent, getEventsForDate } from '../src/db/repositories/eventRepo';
import { getCurrentState } from '../src/services/timeCalculator';
import { ActivityIndicator, View, Text } from 'react-native';
import { useTheme } from '../src/utils/theme';
import { useNotificationSetup } from '../src/hooks/useNotificationSetup';

export default function RootLayout() {
  const router = useRouter();
  const { user, loadUser, loading } = useUserStore();
  const navigationState = useRootNavigationState();
  const { colors } = useTheme(user?.themePreference);

  // Wire notification tap → navigation
  useNotificationSetup();

  // Initialize DB and load user on first mount
  useEffect(() => {
    (async () => {
      await initializeDatabase();
      await loadUser();
      configureNotificationHandler();
    })();
  }, []);

  // Auto-redirect once user is loaded and navigation is ready
  useEffect(() => {
    if (!navigationState?.key || loading) return;

    if (!user?.isOnboarded) {
      router.replace('/onboarding');
    } else {
      router.replace('/(tabs)');
    }
  }, [user, loading, navigationState?.key]);

  // Schedule tray change notification + alarms after user loads
  useEffect(() => {
    if (!user?.isOnboarded || !user.notificationsEnabled) return;

    (async () => {
      // Tray change reminder
      const currentTrayRecord = await getCurrentTrayRecord();
      if (currentTrayRecord) {
        const nextChange = calculateNextChangeDateWithDay(
          new Date(currentTrayRecord.startDate),
          user.changeFrequencyDays,
          user.trayChangeDay,
          user.trayChangeTime
        );
        await scheduleTrayChangeReminder(
          nextChange,
          user.currentTray + 1,
          user.trayChangeTime
        );
      }

      // Put-back-in alarm if trays are currently out
      if (user.alarmsEnabled) {
        const todayEvents = await getEventsForDate(new Date());
        const state = getCurrentState(todayEvents);
        if (state === 'out') {
          const latest = await getLatestEvent();
          if (latest) {
            const minutesOut = Math.round((Date.now() - latest.timestamp.getTime()) / 60000);
            if (minutesOut >= user.alarmThresholdMinutes) {
              const fireAt = new Date(Date.now() + 5 * 60 * 1000);
              const severity = minutesOut > 90 ? 'urgent' : minutesOut > 60 ? 'firm' : 'gentle';
              await schedulePutBackInAlarm(fireAt, severity, minutesOut);
            }
          }
        } else if (state === 'in') {
          // Trays are in — schedule morning prompt asking if they stayed in overnight
          const latest = await getLatestEvent();
          if (latest) {
            await scheduleOvernightPrompt(latest.timestamp);
          }
        }
      }
    })();
  }, [user?.isOnboarded, user?.notificationsEnabled, user?.alarmsEnabled, user?.changeFrequencyDays, user?.trayChangeTime, user?.currentTray, user?.alarmThresholdMinutes]);

  // Loading state — show splash screen as a conditional render (not a route)
  if (loading || !navigationState?.key) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary }}>
        <Text style={{ fontSize: 80, marginBottom: 16 }}>🦷</Text>
        <Text style={{ fontSize: 36, fontWeight: '800', color: '#fff', marginBottom: 8 }}>Tray Tracker</Text>
        <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', marginBottom: 48 }}>Track your Invisalign wear time</Text>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="tray-change" options={{ presentation: 'modal' }} />
    </Stack>
  );
}