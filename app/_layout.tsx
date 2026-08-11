import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';
import { useUserStore } from '../src/stores/useUserStore';
import { initializeDatabase } from '../src/db/client';
import { configureNotificationHandler, scheduleTrayChangeReminder } from '../src/services/notifications';
import { calculateNextChangeDate } from '../src/services/trayScheduler';
import { getCurrentTrayRecord } from '../src/db/repositories/trayRepo';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const router = useRouter();
  const { user, loadUser, loading } = useUserStore();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    (async () => {
      await initializeDatabase();
      await loadUser();
      configureNotificationHandler();
    })();
  }, []);

  useEffect(() => {
    if (!navigationState?.key || loading) return;

    if (!user?.isOnboarded) {
      router.replace('/onboarding');
    } else {
      router.replace('/(tabs)');
    }
  }, [user, loading, navigationState?.key]);

  // Schedule tray change notification after user loads
  useEffect(() => {
    if (!user?.isOnboarded || !user.notificationsEnabled) return;

    (async () => {
      const currentTrayRecord = await getCurrentTrayRecord();
      if (currentTrayRecord) {
        const nextChange = calculateNextChangeDate(
          new Date(currentTrayRecord.startDate),
          user.changeFrequencyDays
        );
        await scheduleTrayChangeReminder(
          nextChange,
          user.currentTray + 1,
          user.trayChangeTime
        );
      }
    })();
  }, [user?.isOnboarded, user?.notificationsEnabled, user?.changeFrequencyDays, user?.trayChangeTime, user?.currentTray]);

  if (loading || !navigationState?.key) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="tray-change" options={{ presentation: 'modal' }} />
    </Stack>
  );
}