import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import type { Theme } from '../utils/theme';

interface TimerCardProps {
  alarmFireAt: Date;
  onPress: () => void;
  colors: Theme['colors'];
}

export function TimerCard({ alarmFireAt, onPress, colors }: TimerCardProps) {
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    const update = () => {
      const diff = alarmFireAt.getTime() - Date.now();
      setRemainingMs(Math.max(0, diff));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [alarmFireAt]);

  if (remainingMs <= 0) return null;

  const totalMinutes = Math.floor(remainingMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const seconds = Math.floor((remainingMs % 60000) / 1000);
  const display = hours > 0
    ? `${hours}h ${minutes}m ${seconds}s`
    : `${minutes}m ${seconds}s`;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.warning + '20', borderColor: colors.warning }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>⏰</Text>
      <View style={styles.content}>
        <Text style={[styles.label, { color: colors.text }]}>Put-back-in alarm</Text>
        <Text style={[styles.countdown, { color: colors.warning }]}>{display}</Text>
      </View>
      <Text style={[styles.tapHint, { color: colors.textTertiary }]}>Tap to adjust</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    marginHorizontal: 24,
  },
  icon: { fontSize: 28 },
  content: { flex: 1 },
  label: { fontSize: 14, fontWeight: '600' },
  countdown: { fontSize: 24, fontWeight: '800', marginTop: 2 },
  tapHint: { fontSize: 12 },
});