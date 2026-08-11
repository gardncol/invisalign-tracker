import { View, Text, StyleSheet } from 'react-native';
import type { Theme } from '../utils/theme';

interface TrayProgressProps {
  current: number;
  total: number;
  pct: number;
  colors: Theme['colors'];
}

export function TrayProgress({ current, total, pct, colors }: TrayProgressProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>Tray {current} of {total}</Text>
      <View style={[styles.barBackground, { backgroundColor: colors.barTrack }]}>
        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: colors.primary }]} />
      </View>
      <Text style={[styles.pct, { color: colors.textSecondary }]}>{pct}% complete</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  label: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  barBackground: { width: 200, height: 12, borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 6 },
  pct: { fontSize: 14, marginTop: 4 },
});