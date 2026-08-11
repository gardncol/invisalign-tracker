import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  requestNotificationPermissions,
  configureNotificationHandler,
  setupNotificationResponseListener,
} from '../services/notifications';

export function useNotificationSetup() {
  const router = useRouter();

  useEffect(() => {
    configureNotificationHandler();

    (async () => {
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