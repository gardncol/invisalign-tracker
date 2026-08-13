import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  requestNotificationPermissions,
  configureNotificationHandler,
  setupAndroidNotificationChannel,
  setupNotificationResponseListener,
} from '../services/notifications';

export function useNotificationSetup() {
  const router = useRouter();

  useEffect(() => {
    configureNotificationHandler();

    (async () => {
      // Set up the Android notification channel with HIGH importance so
      // that notifications are displayed as heads-up banners even when
      // the app is in the foreground.
      await setupAndroidNotificationChannel();

      const granted = await requestNotificationPermissions();
      if (!granted) {
        console.warn('Notification permissions not granted');
      }
    })();

    const subscription = setupNotificationResponseListener(
      (trayNumber) => {
        // Navigate to tray change confirmation
        router.push(`/tray-change?tray=${trayNumber}`);
      },
      () => {
        // Navigate to home to toggle trays in
        router.push('/');
      }
    );

    return () => {
      subscription.remove();
    };
  }, [router]);
}