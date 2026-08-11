import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../src/stores/useUserStore';
import { useTheme } from '../src/utils/theme';

export default function SplashScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  const { colors } = useTheme(user?.themePreference);

  const handleStart = () => {
    if (user?.isOnboarded) {
      router.replace('/(tabs)');
    } else {
      router.replace('/onboarding');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <Text style={styles.emoji}>🦷</Text>
      <Text style={styles.title}>Tray Tracker</Text>
      <Text style={styles.subtitle}>Track your Invisalign wear time</Text>
      <TouchableOpacity style={styles.button} onPress={handleStart} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emoji: { fontSize: 80, marginBottom: 16 },
  title: { fontSize: 36, fontWeight: '800', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 18, color: 'rgba(255,255,255,0.8)', marginBottom: 48 },
  button: { backgroundColor: '#fff', borderRadius: 16, paddingVertical: 18, paddingHorizontal: 48 },
  buttonText: { fontSize: 20, fontWeight: '700', color: '#007AFF' },
});