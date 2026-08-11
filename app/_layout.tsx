import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';
import { useUserStore } from '../src/stores/useUserStore';
import { initializeDatabase } from '../src/db/client';
import { configureNotificationHandler, scheduleTrayChangeReminder, schedulePutBackInAlarm } from '../src/services/notifications';
import { calculateNextChangeDateWithDay } from '../src/services/trayScheduler';
import { checkAndScheduleAlarm } from '../src/services/alarmManager';
import { getCurrentTrayRecord } from '../src/db/repositories/trayRepo';
import { getLatestEvent, getEventsForDate } from '../src/db/repositories/eventRepo';
import { getCurrentState } from '../src/services/timeCalculator';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '../src/utils/theme';

export default function RootLayout() {
  const router = useRouter();
  const { user, loadUser, loading } = useUserStore();
  const navigationState = useRootNavigationState();
  const { colors } = useTheme(user?.themePreference);

  useEffect(() => {
    (async () => {
      await initializeDatabase();
      await loadUser();
      configureNotificationHandler();
    })();
  }, []);

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
              const fireAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min from now
              const severity = minutesOut > 90 ? 'urgent' : minutesOut > 60 ? 'firm' : 'gentle';
              await schedulePutBackInAlarm(fireAt, severity, minutesOut);
            }
          }
        }
      }
    })();
  }, [user?.isOnboarded, user?.notificationsEnabled, user?.alarmsEnabled, user?.changeFrequencyDays, user?.trayChangeTime, user?.currentTray, user?.alarmThresholdMinutes]);

  if (loading || !navigationState?.key) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="splash" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="tray-change" options={{ presentation: 'modal' }} />
    </Stack>
  );
}